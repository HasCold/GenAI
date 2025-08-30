import readlineSync from "readline-sync";
import { gemini_api_key } from "../shared/constant.js";
import { fetchCryptoPriceFuncDeclaration, primeFuncDeclaration, sumFuncDeclaration } from "./methods/methods.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: gemini_api_key});
const History = [];

function sum({num1, num2}) {
    return num1 + num2;
}

function prime({num}) {
    if (num < 2) return false;

    for(let i = 2; i < Math.sqrt(num); i++) {
        if(num % i === 0) return false;
    }

    return true;
}

async function fetchCryptoPrice({coin}) {
   const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`)
   const data = await response.json();

   return data;
}

const availableTools = {
    sum: sum,
    prime: prime,
    fetchCryptoPrice: fetchCryptoPrice,
}

const SYSTEM_PROMPT = `
    You are an AI Agent, You have access of 3 available tools like to find sum of 2 number, get crypto price of any currency and find a number is prime or not
                
    Use these tools whenever required to confirm user query.
    If user ask general question you can answer it directly if you don't need help of these three tools
` 

async function runAgent(userQuery) {
    History.push({
        role: "user",
        parts: [{text: userQuery}]
    });

    // while -->> true because may be our LLM calls another function after one round trip processing 
    while(true) {
        
        // re-call the model with updated history
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: History,
            config: {
                systemInstruction: SYSTEM_PROMPT,
            tools: [{
                    functionDeclarations: [sumFuncDeclaration, primeFuncDeclaration, fetchCryptoPriceFuncDeclaration]
                }]
             }
        });

    // if any function call present so we will trigger our mentioned functions
    if(response.functionCalls && response.functionCalls.length > 0) {
        // functionCalls -->> [{}, {}, {}]
        console.log("Model Response -->> ", response.functionCalls[0]);
        const {name, args} = response.functionCalls[0];
        
            const funcInvoke = availableTools[name];
            const result = await funcInvoke(args);
                
            const functionResponsePart = {
                name,
                response: {
                    result: result,
                }
            }

            // push the LLM model function into the history 
            History.push({
                role: 'model',
                parts: [{
                    functionCall: response.functionCalls[0],
                }]
            });

            // Result Push into the history
            History.push({
                role: 'user',
                parts: [
                    {
                        functionResponse: functionResponsePart,
                    }
                ]
            });

    }else {
        // else simple we print the response text from the llm
        History.push({
            role: "model",
            parts: [{text: response.text}]
        });
        console.log(response.text);
        break;
    }
}
}

async function main() {
    const userQuery = readlineSync.question("Ask me anything ------>>> ");
    await runAgent(userQuery)

    main();
}

export default main;


// 1. We have to identify which function has to invoked on userQuery.
// 2. Identify what arguments have to be passed in the function.

// 3. So who can help me in this regard to select which argument and function.
// So we can pass the user query to the LLM and LLM give the answer to the server in structured format which we can use to select the function (tools). --->> AI Agent 
