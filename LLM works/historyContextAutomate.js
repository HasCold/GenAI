import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import { gemini_api_key } from "../shared/constant";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: gemini_api_key});

const chat = ai.chats.create({
  model: "gemini-2.5-flash",
  history: [], // now all the code history or context will maintain by LLM.
});

async function main(){
    const userQuery = readlineSync.question("Ask me anything ---->>> ");
    const response = await chat.sendMessage({
      message: userQuery,
    });

    console.log("\n");
    console.log(response.text);

    main();
}

main();