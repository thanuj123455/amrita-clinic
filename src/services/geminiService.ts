

import { GoogleGenAI, Type } from '@google/genai';
import { addSymptomCheck } from './api';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this project, we assume the key is available.
  console.warn("Gemini API key not found. Symptom checker will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        priorityLevel: {
            type: Type.STRING,
            description: "Classify the priority level. Must be one of: Low, Medium, High."
        },
        suggestedAction: {
            type: Type.STRING,
            description: "Suggest a course of action from these specific options: 'Visit the clinic for a check-up', 'This could be an emergency, please visit the nearest hospital immediately', or 'You can likely manage this with self-care at home. Monitor your symptoms.'"
        },
    }
};

export const getSymptomAnalysis = async (studentId: number, symptoms: string[]): Promise<{ priorityLevel: 'Low' | 'Medium' | 'High'; suggestedAction: string }> => {
    if (!API_KEY) {
        // Fallback for when API key is not available
        const hasHighPrioritySymptom = symptoms.some(s => s.toLowerCase().includes('chest pain') || s.toLowerCase().includes('breathing problems'));
        const priorityLevel = hasHighPrioritySymptom ? 'High' : 'Medium';
        const suggestedAction = hasHighPrioritySymptom ? 'This could be an emergency, please visit the nearest hospital immediately' : 'Visit the clinic for a check-up';
        
        await addSymptomCheck({
            studentId,
            symptomsSelected: symptoms,
            priorityLevel,
            suggestedAction,
        });

        return { priorityLevel, suggestedAction };
    }

    try {
        const prompt = `A student is experiencing the following symptoms: ${symptoms.join(', ')}. Based on this, classify the priority level and suggest a course of action. Adhere strictly to the provided JSON schema.`;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const text = response.text.trim();
        const analysis = JSON.parse(text);

        // Save the check to our mock DB
        await addSymptomCheck({
            studentId,
            symptomsSelected: symptoms,
            priorityLevel: analysis.priorityLevel,
            suggestedAction: analysis.suggestedAction,
        });

        return analysis;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Provide a safe, default response on API failure
        const fallbackResponse = {
            priorityLevel: 'Medium' as const,
            suggestedAction: 'Could not analyze symptoms. Please visit the clinic for a check-up.'
        };

        await addSymptomCheck({
            studentId,
            symptomsSelected: symptoms,
            ...fallbackResponse,
        });

        return fallbackResponse;
    }
};
