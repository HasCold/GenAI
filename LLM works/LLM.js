import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: "AIzaSyAUX6YF4bnXgdT-FDtqQn_VJkfqWjAU0fY"});

// sample for talking with AI
// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents:  [
//         {
//             role: 'user',  // user is us
//             parts: [{text: 'Hi, I m Hasan'}]  // This is our prompt
//         },
//         {
//             role: "model",  // model is our LLM
//             parts: [{text: "Hi Hasan, nice to meet you! How can I help you today"}]  // This is the LLM previous response 
//         },
//         {
//             role: "user",  
//             parts: [{text: "What is my name ?"}]  // This is our new question. 
//         },
//     ] 
//   });

//   console.log(response.text);
// }

//  Now we talk with gemini llm via cmd line package used :- readline-sync

const History = [];

async function Chatting(userQuery) {
    History.push({
        role: "user",
        parts: [{text: userQuery}]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: History
    });
  
    // Now we also save the response of llm to maintain the context overall.
    History.push({
        role: "model",
        parts: [{text: response.text}]
    });

    console.log("\n");
    console.log(response.text);
}
  
async function main(){
    const userQuery = readlineSync.question("Ask me anything ---->>> ");
    await Chatting(userQuery);

    main();
}

main();