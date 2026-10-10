import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/scan-plate', async (req, res) => {
    try {
        const { imageBase64, description } = req.body;
        
        // Use a stable, widely supported model name
        const modelName = 'gemini-2.5-flash';

        let contents = [];

        // Add image if uploaded
        if (imageBase64) {
            contents.push({
                inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                }
            });
        }

        // Add text prompt context
        const promptText = description 
            ? `Analyze this Indian meal/thali based on this description: "${description}". Break it down into Katoris/Mutthis, ingredients, macronutrients, and predict the post-meal glucose spike impact.`
            : `Analyze this Indian thali image. Break down the components into traditional units (Katoris/Mutthis), calculate estimated macros, and predict the glucose spike.`;
        
        contents.push(promptText);

        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
        });

    res.json({ success: true, data: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`AURA server running on port ${PORT}`);
});
