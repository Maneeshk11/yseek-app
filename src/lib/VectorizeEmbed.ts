import { readFileSync } from "fs";
import { Company } from "@/lib/schema";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NextResponse } from "next/server";

export const VectorizeEmbed = async () => {
  try {
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const pinecone = new PineconeClient();
    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex: pinecone.Index(process.env.PINECONE_INDEX || ""),
    });

    const json_doc = readFileSync(
      process.cwd() + "/src/lib/data/companies.json"
    ).toString();
    const companies: Company[] = JSON.parse(json_doc);
    const docs: Document[] = [];

    companies.forEach((comp) => {
      const doc = new Document({
        pageContent: comp.description,
        metadata: {
          name: comp.name,
          header: comp.header,
          tags: comp.tags,
          logo_url: comp.logo_url,
        },
      });
      docs.push(doc);
    });

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Adjust based on your needs
      chunkOverlap: 200,
    });

    const splitDocs = (await textSplitter.splitDocuments(docs)).filter(
      (doc) => {
        if (!doc.pageContent || typeof doc.pageContent !== "string") {
          console.warn(
            "Skipping document with invalid content:",
            doc.metadata.name
          );
          return false;
        }
        return true;
      }
    );

    await vectorStore.addDocuments(splitDocs);
  } catch (error) {
    return NextResponse.json({
      error: error,
      message: "Error while trying to add vectors into db",
    });
  }
};
