import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY 
});


export async function explainCode(req, res) {
  try {
    const { code } = req.body;
    const user = req.user;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "You are not logged in",
      });
    }

    //check if code is too long(more than 1000 char)
    if (code.length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Input is too large. Please provide code with less than 1000 characters.",
      });
    }
    const prompts = `
    You are a GenAI expert full stack software engineer.
    Explain this code in simple terms:
    - What does this code do?
    - Break down each part
    - Use beginner- friendly language
    - Include examples if helpful
    - Do not include any unwanted special characters
     
    CODE: ${code}
    
    Response format should be a JSON array of objects with "title" and "explaination" fields
    Example: 
    [
    {
    "title": "What does this code do?,
    "explaination": "This code creates a..."
    },
    {
      "title": "Break down: Variable Declaration",
      "explaination": "The variable 'X' is..."
    },

    ]
    Keep explanations concise (under 400 words ).
    Do not include any text outside the JSON array.
`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompts,
      config: {
        responseMimeType: "application/json",
      },
    });
    console.log(response.text);
    if (response.text) {
      return res.status(200).json({
        success: true,
        payload: {
          aiResponse: JSON.parse(response?.text) || "",
          timestamp: new Date(),
        },
        message: "Code explained successfully",
      });
    }
  } catch (error) {
    console.error("error explaining code", error?.message);
    return res.status(500).json({
      success: false,
      message: "Failed to explain code",
    });
  }
}
