from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil
import uuid

from src.indexer import (
    DuplicateDocumentError,
    DocumentNotFoundError,
    get_document_filename,
    load_chunks,
    load_index,
    load_metadata,
    index_pdf,
    delete_document,
    reindex_document
)
from src.pipeline import RAGPipeline


app = FastAPI(
    title="RAG API",
    description="Retrieval-Augmented Generation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    conversation_id: str | None = None
    document_name: str | None = None


def reload_pipeline():
    try:
        chunks = load_chunks()
        index = load_index()
        app.state.pipeline = RAGPipeline(chunks, index)
        app.state.pipeline_error = None
        return True
    except Exception as error:
        app.state.pipeline = None
        app.state.pipeline_error = error
        return False


@app.on_event("startup")
def load_rag_pipeline():
    reload_pipeline()


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "RAG API is running"
    }


@app.get("/status")
def get_status():
    try:
        metadata = load_metadata()
        chunks = load_chunks()
        return {
            "status": "ready",
            "document_count": len(metadata.get("documents", [])),
            "chunk_count": len(chunks),
            "documents": metadata.get("documents", [])
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "document_count": 0,
            "chunk_count": 0,
            "documents": []
        }


@app.get("/documents")
def get_documents():
    try:
        metadata = load_metadata()
        chunks = load_chunks()
        documents_metadata = metadata.get("documents", [])
        
        doc_chunks = {}
        for chunk in chunks:
            doc_name = chunk.get("document", "unknown")
            doc_chunks[doc_name] = doc_chunks.get(doc_name, 0) + 1

        documents = []
        for document in documents_metadata:
            name = get_document_filename(document)

            if isinstance(document, dict):
                documents.append({
                    "id": document.get("id"),
                    "name": name,
                    "filename": name,
                    "page_count": document.get("page_count", 0),
                    "chunks": document.get("chunk_count", doc_chunks.get(name, 0)),
                    "status": document.get("status", "indexed")
                })
                continue

            documents.append({
                "name": name,
                "chunks": doc_chunks.get(name, 0),
                "status": "indexed"
            })
        return {"documents": documents, "total_chunks": len(chunks)}
    except Exception as e:
        return {"documents": [], "total_chunks": 0, "error": str(e)}


@app.post("/ask")
def ask_question(request: QuestionRequest):
    if not hasattr(app.state, "pipeline") or app.state.pipeline is None:
        reload_pipeline()

    if app.state.pipeline is None:
        error = getattr(app.state, "pipeline_error", None)
        detail = "RAG pipeline/index is unavailable."
        if error:
            detail = f"{detail} {error}"
        raise HTTPException(status_code=500, detail=detail)

    result = app.state.pipeline.ask(
        request.question,
        request.conversation_id,
        request.document_name
    )
    return result


@app.delete("/conversations/{conversation_id}")
def reset_conversation(conversation_id: str):
    if not hasattr(app.state, "pipeline") or app.state.pipeline is None:
        raise HTTPException(status_code=500, detail="RAG Pipeline is not initialized or index missing.")

    app.state.pipeline.reset_conversation(conversation_id)
    return {"conversation_id": conversation_id, "message": "Conversation reset"}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    upload_dir = Path("data/raw")
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        index_pdf(file_path)
        reload_pipeline()
        return {"message": f"Successfully indexed {file.filename}", "filename": file.filename}
    except DuplicateDocumentError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index document: {str(e)}")


@app.delete("/documents/{document_id}")
def delete_document_endpoint(document_id: str):
    try:
        delete_document(document_id)
        reload_pipeline()
        return {"message": f"Deleted document {document_id}"}
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@app.post("/documents/{document_id}/reindex")
async def reindex_document_endpoint(document_id: str, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    upload_dir = Path("data/raw")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # save to a unique temp filename so we don't collide with existing file names
    unique_name = f"reindex-{uuid.uuid4().hex}-{file.filename}"
    file_path = upload_dir / unique_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        reindex_document(document_id, file_path)
        reload_pipeline()
        return {"message": f"Reindexed document {document_id}", "filename": unique_name}
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reindex document: {str(e)}")
