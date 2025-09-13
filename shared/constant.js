import dotenv from "dotenv";
dotenv.config();

export const gemini_api_key = process.env.GEMINI_API_KEY;

export const pinecone_api_key = process.env.PINECONE_API_KEY;
export const pinecone_environment = process.env.PINECONE_ENVIRONMENT;
export const pinecone_index_name = process.env.PINECONE_INDEX_NAME;