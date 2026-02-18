import { GoogleGenAI } from "@google/genai";
import { File } from 'expo-file-system';

const genAI = new GoogleGenAI({ apiKey:"AIzaSyCOZCwFvRNo6T31eL_PUXz9k4DtIGf2FsM"});

export const describeImage = async (imageUri: string): Promise<string> => {
  try {
    // 1. Read the image as Base64
    const file = new File(imageUri);
    const base64Data = await file.base64();
    // 3. Prepare the prompt
    const prompt = "Provide a concise, one-sentence description of this image for a search index.";

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg", // or extract from fileName
      },
    };

    // 4. Generate content
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite", // cheapest + vision-capable
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
              }
            }
          ]
        }
      ]
    });
    const description = result.text?.trim()
    if(!description){
      throw(new Error("Generation Failed: Generated an Empty String"))
    }
    return description;
  } catch (error) {
    console.error("AI Description Error:", error);
    return "No description available.";
  }
};