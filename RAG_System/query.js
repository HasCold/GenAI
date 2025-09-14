import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import readlineSync from 'readline-sync';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const History = []

const transformQuery = async (question) => {
    // This LLM will track our user questions and will give us the new question based on the history but in a proper meaningful context.
    // Can be look at the image :- LLM_questioning_maintain.png

    History.push({
        role:'user',
        parts:[{text:question}]
    });  
    
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: History,
        config: {
          systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
        Only output the rewritten question and nothing else.
          `,
        },
    });
     
    // Push into the history and then pop.
    History.pop()
     
    return response.text
}

const chatting = async (question) => {
    try {
        // Transform query
        const queries = await transformQuery(question);

    // Creating a vector embedding
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });
    const queryVector = await embeddings.embedQuery(queries); 

    // Make a connection with pinecone DB so we can fetch the details regarding the document.
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // So we have to search the semantics or relevant info of this queryVector
    const searchResults = await pineconeIndex.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
    });
    
    // Top 10 documents: 10 metadata text parts 10 document
    // Create the context for LLM model.
    const context = searchResults.matches
                   .map(match => match.metadata.text)
                   .join("\n\n---\n\n");

    // Now give the context to our LLM.
    History.push({
        role:'user',
        parts:[{text:question}]
    });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: History,
        // Our llm model has to give the answer only from the given context so we indirectly reject the halucination process in the SYSTEM INSTRUCTION.
        config: {
          systemInstruction: `You have to behave like a Data Structure and Algorithm Expert.
        You will be given a context of relevant information and a user question.
        Your task is to answer the user's question based ONLY on the provided context.
        If the answer is not in the context, you must say "I could not find the answer in the provided document."
        Keep your answers clear, concise, and educational.
          
          Context: ${context}
          `,
        },
    });
    
    History.push({
      role:'model',
      parts:[{text:response.text}]
    })
    
    console.log("\n");
    console.log("LLM Response :- ", response.text);
    
    } catch (error) {
        console.log("❌ Error occurred:", error.message);
        console.log("Full error:", error);
    }
}

async function query(){
   const userProblem = readlineSync.question("Ask me anything--> ");

   // Now convert the user question into vectors by model vector embedding.    
   await chatting(userProblem);
   query();
}


query();