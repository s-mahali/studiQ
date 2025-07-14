import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config();



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyAg92EvF_eQEP0UPAbctlScTL9o84zyc9A"
});



const prompts = `
    You are a GenAI expert full stack software engineer.
    Explain this code in simple terms:
    - What does this code do?
    - Break down each part
    - Use beginner- friendly language
    - Include examples if helpful
    - use markdown format
    
    Code:
     function add(a, b) {
       return a + b
     }
    Note: Do not include prompt header
    response format: array of an object 
    examples:  [
    {},
    {},
    {},
    {},
    {},
    ]
`
async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompts,
    config: {
      responseMimeType: "application/json",
    }
  });
  console.log(response.text);
}

await main();