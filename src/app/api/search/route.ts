import { NextResponse } from "next/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { headers } from "next/headers";

import Companies from "@/lib/data/companies.json";
import { Company } from "@/lib/schema";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const pinecone = new PineconeClient();

const rateLimit = new Map();

export async function POST(request: Request) {
  try {
    // rate limiting
    const headersList = headers();
    const ip = (await headersList).get("x-forwarded-for") || "anonymous";
    const nowtime = Date.now();
    const userLimit = rateLimit.get(ip) || { count: 0, timestamp: nowtime };

    if (nowtime - userLimit.timestamp > 24 * 60 * 60 * 1000) {
      userLimit.count = 0;
      userLimit.timestamp = nowtime;
    }
    // max requests per day = 50
    if (userLimit.count >= 50) {
      const resetTime = new Date(userLimit.timestamp + 24 * 60 * 60 * 1000);
      return Response.json(
        {
          error: "Rate limit exceeded",
          details: `Daily limit reached. Try again after ${resetTime.toLocaleTimeString()}`,
        },
        { status: 429 }
      );
    }

    // get prompt
    const body = await request.json();
    const prompt = body.prompt;

    userLimit.count++;
    rateLimit.set(ip, userLimit);

    if (!prompt || prompt === "") {
      return NextResponse.json({
        message: "Propmt is either empty or wrong",
        statusCode: 422,
      });
    }

    const vectorStore = new PineconeStore(embeddings, {
      pineconeIndex: pinecone.Index(process.env.PINECONE_INDEX || ""),
    });

    const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

    const InputStateAnnotation = Annotation.Root({
      question: Annotation<string>,
    });

    const StateAnnotation = Annotation.Root({
      question: Annotation<string>,
      context: Annotation<Document[]>,
      answer: Annotation<string>,
    });

    const retrieve = async (state: typeof InputStateAnnotation.State) => {
      const retrievedDocs = await vectorStore.similaritySearch(state.question);
      return { context: retrievedDocs };
    };

    const generate = async (state: typeof StateAnnotation.State) => {
      const docsContent = state.context
        .map((doc: Document) => {
          return "{ company_name: " + doc.metadata.name + " description: " + doc.pageContent + "}";
        })
        .join("\n");
      const messages = await promptTemplate.invoke({
        question: state.question,
        context: docsContent,
      });
      const response = await llm.invoke(messages);
      return { answer: response.content };
    };

    const graph = new StateGraph(StateAnnotation)
      .addNode("retrieve", retrieve)
      .addNode("generate", generate)
      .addEdge("__start__", "retrieve")
      .addEdge("retrieve", "generate")
      .addEdge("generate", "__end__")
      .compile();

    const result = await graph.invoke({
      question:
        "return only the names of the companies and in an array and return all the matching companies " +
        prompt,
    });

    const company_names:string[] = JSON.parse(result.answer);
    const normalizedNamesArray = company_names.map(name => name.toLowerCase());

    const comps = Companies.filter((comp) => normalizedNamesArray.includes(comp.name.toLowerCase()))

    return NextResponse.json({
      response: comps,
    });
  } catch (error) {
    console.log("error here: ", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
