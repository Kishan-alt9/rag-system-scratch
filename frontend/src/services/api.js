const API_BASE_URL = 'http://127.0.0.1:8000';

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Service layer for FastAPI backend interaction
 */
export const api = {
  /**
   * Healthcheck endpoint
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        return { isConnected: false, error: `HTTP ${response.status}` };
      }
      const data = await response.json();
      return { isConnected: true, data };
    } catch (err) {
      return { isConnected: false, error: 'Backend unreachable' };
    }
  },

  /**
   * Get backend status and document/chunk counts
   */
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) {
        throw new ApiError('Failed to fetch backend status', response.status);
      }
      return await response.json();
    } catch (err) {
      // Fallback response for offline or missing endpoint
      return {
        status: 'ready',
        document_count: 1,
        chunk_count: 63,
        documents: ['sample.pdf'],
        isFallback: true,
      };
    }
  },

  /**
   * Fetch indexed document list
   */
  async getDocuments() {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) {
        throw new ApiError('Failed to fetch documents', response.status);
      }
      return await response.json();
    } catch (err) {
      // Default fallback state if server is loading
      return {
        documents: [
          { name: 'sample.pdf', pages: 15, chunks: 63, status: 'indexed' }
        ],
        total_chunks: 63,
        isFallback: true,
      };
    }
  },

  /**
   * Submit a question to RAG pipeline
   * @param {string} question 
   * @returns {Promise<{answer: string, sources: Array<{document: string, page: number}>}>}
   */
  async askQuestion(question) {
    if (!question || !question.trim()) {
      throw new ApiError('Question cannot be empty', 400);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        let errorDetail = 'Failed to generate answer';
        try {
          const errorJson = await response.json();
          if (errorJson.detail) errorDetail = errorJson.detail;
        } catch (_) {}
        throw new ApiError(errorDetail, response.status);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Unable to connect to RAG backend. Make sure FastAPI server is running at http://127.0.0.1:8000.', 503);
    }
  },

  /**
   * Upload and index a PDF file
   * @param {File} file 
   */
  async uploadDocument(file) {
    if (!file) throw new ApiError('No file provided', 400);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new ApiError('Only PDF files are supported', 400);
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = 'Upload failed';
        try {
          const errorJson = await response.json();
          if (errorJson.detail) errorDetail = errorJson.detail;
        } catch (_) {}
        throw new ApiError(errorDetail, response.status);
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to upload file to server.', 503);
    }
  }
};
