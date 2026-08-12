# RAG from Scratch using Ollama and FAISS

## What is this project?

This project is a Retrieval-Augmented Generation (RAG) system that allows users to ask natural language questions about a PDF document and receive context-aware answers. Instead of searching the entire document manually, the system retrieves the most relevant sections using semantic search and generates accurate responses using a Large Language Model (LLM). This enables users to quickly access information from large documents in a conversational way.

## Architecture

                 PDF Document
                      │
                      ▼
               PDF Loader (PyMuPDF)
                      │
                      ▼
                 Text Chunking
                      │
                      ▼
        Embedding Generation (Ollama)
                      │
                      ▼
            FAISS Vector Database
                      ▲
                      │
             User Question
                      │
                      ▼
         Generate Question Embedding
                      │
                      ▼
              Semantic Search
                      │
                      ▼
          Retrieve Relevant Chunks
                      │
                      ▼
          Prompt Construction
                      │
                      ▼
             Llama 3.2 (Ollama)
                      │
                      ▼
               Final AI Answer
```