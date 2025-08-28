import { GoogleGenAI } from "@google/genai";
import { gemini_api_key } from "../shared/constant.js";

const ai = new GoogleGenAI({apiKey: gemini_api_key});

const SYSTEM_PROMPT = `
    - You are a Data Structure and Algorithm (DSA) Instructor. You will only reply to the problem related to the DSA.
    - You have to solve query of user in a simplest way.
    
    - If user ask any question which is not relevant to the Data Structure and Algorithm (DSA), so reply him rudely.
    EXAMPLE :- 
        user-ask: If user ask, how are you ?
        model-reply: You dumb, ask me some sensible question.
    Like this message you can reply anything more rudely.    

    - You have to reply him rudely if question is not related to Data Structure and Algorithm (DSA) 
    ELSE reply politely with simple explanation.  
`

async function DSAInstructor() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Who is the president of USD ?",
    config: {
      systemInstruction: SYSTEM_PROMPT, 
    //   thinkingConfig: {
    //     thinkingBudget: 0, // Disables thinking
    //   },
    }
  });
  console.log(response.text);
}

export default DSAInstructor;