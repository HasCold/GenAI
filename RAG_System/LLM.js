import * as dotenv from 'dotenv';
dotenv.config({ path: "../.env" });

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { gemini_api_key } from '../shared/constant.js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

// Configure the vector DB (Pinecone)
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY 
}); // basically this line will automatically grab your environment variables from .env file like PINECONE_API_KEY, PINECONE_ENVIRONMENT
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// So in this process we have to create an index only once like one time store the vectors of document in vector DB.
const indexDcoument = async () => {
    // Phase 1: PDF or Document Loading
    const PDF_PATH = './dsa.pdf';
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();
    console.log("----- PDF Loaded -----");
    
    // Phase 2: Chunking of rawDocs
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,  // means 1000 characters in each chunk
        chunkOverlap: 200, // means how many characters will be overlap in each chunk so the context will not lose.
        // 0 - 1000
        // 801 - 1800 --->>> Overlap 200 characters
        // 1801 - 2800 --->>> Overlap 200 characters
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs); // we have seen the maximum chunkedDocs can be seen around 227. 
    console.log("----- Chunking Completed -----");

    // Configure the embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });
    console.log("----- Embedding model configured -----");

    
    // langChain ==>> (chunking, embedding model, vector DB) 
    // Generate vector by telling your vector embedding model.
    // Phase 3: Convert each chunk into vector (for the vector embedding this can be done by our LLM model like gemini or openai but we will used here Langchan JS for embedding).
    // Phase 4: 
    // Store the vectors in the vector DB (Pinecone).
    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        pineconeIndex,
        maxConcurrency: 5,  // 5 chunkedDocs can be concurrently converted into vectors and then it will be store into the vector DB. 
    }); 

    console.log("----- Data Stored Successfully -----");
}

indexDcoument();

// We have set the 768 diemensions in vector DB (Pinecone). It means we searched based on semantics or relevancy.

// Phase 5: Query the vector DB (Pinecone)
// Phase 6: Retrieve the most semantic or relevancy chunks
// Phase 7: Generate the response

// So all these phases are done by the different various ways. So we can used the Langchain framework to do all these phases.
// Langchain is a utility tool which has a pre-build functions, modules and tools which ease our work basically.


// Langchain JS interact with google generative ai link :- https://js.langchain.com/docs/integrations/text_embedding/google_generativeai/
// Langchain JS interact with pinecone link :- https://js.langchain.com/docs/integrations/vectorstores/pinecone/