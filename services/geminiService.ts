
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from '../types';

// Use a singleton pattern to lazy-initialize the AI client.
// This prevents the app from crashing on load if the API key is not set.
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    
    // FIX: Use process.env.API_KEY to access the API key as per guidelines.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This error will be caught by the calling function's try/catch block.
        // The App-level ApiKeyChecker should prevent this from being called in the first place.
        throw new Error("API_KEY environment variable not set. AI features are disabled.");
    }
    
    ai = new GoogleGenAI({ apiKey });
    return ai;
};


const questionSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "The full text of the question." },
        type: { type: Type.STRING, description: "Type of question: 'Multiple Choice', 'True/False', or 'Short Answer'."},
        alternatives: {
            type: Type.ARRAY,
            description: "List of possible answers.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The text of the answer alternative." },
                    isCorrect: { type: Type.BOOLEAN, description: "Whether this alternative is the correct answer." },
                },
                required: ['text', 'isCorrect']
            },
        },
        subject: { type: Type.STRING, description: "A relevant subject for the question (e.g., 'Geography')." },
        difficulty: { type: Type.STRING, description: "Difficulty level: 'Easy', 'Medium', or 'Hard'." },
        bncc: { type: Type.ARRAY, description: "An array with one suggested BNCC code.", items: { type: Type.STRING } },
        descritores: { type: Type.ARRAY, description: "An array with one suggested Descritor code.", items: { type: Type.STRING } },
    },
    required: ['text', 'type', 'alternatives', 'subject', 'difficulty', 'bncc', 'descritores']
};


export const suggestClassification = async (questionText: string): Promise<{ bncc: string; descritor: string; difficulty: 'Easy' | 'Medium' | 'Hard' }> => {
    try {
        const response = await getAI().models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Given the question "${questionText}", classify it according to the Brazilian educational standards. Provide one BNCC code, one Descritor code, and a difficulty level ('Easy', 'Medium', or 'Hard').`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bncc: { type: Type.STRING },
                        descritor: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                    },
                    required: ['bncc', 'descritor', 'difficulty']
                },
            },
        });
        const result = JSON.parse(response.text);
        if (!['Easy', 'Medium', 'Hard'].includes(result.difficulty)) {
            result.difficulty = 'Medium';
        }
        return result;
    } catch (error) {
        console.error("Error suggesting classification:", error);
        throw new Error("Failed to get AI classification.");
    }
};

export const suggestAlternativePhrasing = async (questionText: string): Promise<string[]> => {
    try {
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 3 alternative phrasings for the following question: "${questionText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error suggesting alternative phrasing:", error);
        throw new Error("Failed to get AI suggestions.");
    }
};

export const generateDistractors = async (question: Question): Promise<string[]> => {
    try {
        const correctAnswer = question.alternatives.find(a => a.isCorrect)?.text;
        if (!correctAnswer) {
            console.warn("Cannot generate distractors without a correct answer.");
            return [];
        }
        const prompt = `For the multiple-choice question "${question.text}", the correct answer is "${correctAnswer}". Generate 3 plausible but incorrect answer choices (distractors).`;
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating distractors:", error);
        throw new Error("Failed to generate AI distractors.");
    }
};

export const generateQuestion = async (topic: string): Promise<Question> => {
    try {
        const response = await getAI().models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a medium-difficulty multiple-choice question about "${topic}". Include one correct answer and three incorrect distractors. Also suggest a subject, one BNCC code, and one Descritor code. The difficulty must be 'Easy', 'Medium', or 'Hard'. Ensure there is only one correct answer.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: questionSchema,
            },
        });

        const generatedData = JSON.parse(response.text);
        
        return {
            id: `q${Date.now()}`,
            imageUrl: '',
            ...generatedData,
            alternatives: generatedData.alternatives.map((alt: any, index: number) => ({...alt, id: `a${Date.now()}${index}`})),
        };
    } catch (error) {
        console.error("Error generating question:", error);
        throw new Error("Failed to generate AI question.");
    }
};

export const extractQuestionsFromPdf = async (pdfBase64: string): Promise<Question[]> => {
    const prompt = `Analyze the content of this PDF file and extract all the educational questions you can find. For each question, provide the following details in a structured JSON format:
1.  \`text\`: The full text of the question.
2.  \`type\`: The type of question. Use 'Multiple Choice', 'True/False', or 'Short Answer'.
3.  \`alternatives\`: An array of objects for the answer choices. Each object should have \`text\` (the alternative's text) and \`isCorrect\` (a boolean, true if it's the correct answer, false otherwise). For short answer questions, provide a single alternative with the correct answer.
4.  \`subject\`: Suggest a relevant subject for the question (e.g., 'Geography', 'Math').
5.  \`difficulty\`: Classify the difficulty as 'Easy', 'Medium', or 'Hard'.
6.  \`bncc\`: Suggest an array with one relevant Brazilian BNCC code as a string.
7.  \`descritores\`: Suggest an array with one relevant Descritor code as a string.

Ensure that for multiple-choice questions, only one alternative has \`isCorrect\` set to true. If you cannot determine the content, return an empty array.`;

    try {
        const response = await getAI().models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: pdfBase64,
                    },
                },
                { text: prompt },
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: questionSchema
                },
            },
        });

        const extractedData: any[] = JSON.parse(response.text);

        return extractedData.map((q: any) => ({
            id: `q${Date.now()}-${Math.random()}`,
            imageUrl: '',
            ...q,
            alternatives: q.alternatives.map((alt: any, index: number) => ({
                ...alt,
                id: `a${Date.now()}-${Math.random()}-${index}`,
            })),
        }));

    } catch (error) {
        console.error("Error extracting questions from PDF:", error);
        throw new Error("Failed to extract questions from PDF.");
    }
};
