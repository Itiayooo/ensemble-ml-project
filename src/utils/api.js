import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== ASSESSMENT APIs ====================

export const createUser = async (email, name) => {
  const response = await api.post('/api/assessment/user', { email, name });
  return response.data;
};

export const startAssessment = async (userId) => {
  const response = await api.post('/api/assessment/start', { user_id: userId });
  return response.data;
};

export const getSessionStatus = async (sessionId) => {
  const response = await api.get(`/api/assessment/status/${sessionId}`);
  return response.data;
};

// ==================== QUIZ APIs ====================

export const startQuiz = async (sessionId) => {
  const response = await api.get(`/api/quiz/start/${sessionId}`);
  return response.data;
};

export const submitQuiz = async (sessionId, answers) => {
  const response = await api.post('/api/quiz/submit', {
    session_id: sessionId,
    answers: answers,
  });
  return response.data;
};

// ==================== CODING APIs ====================

export const startCoding = async (sessionId) => {
  const response = await api.get(`/api/coding/start/${sessionId}`);
  return response.data;
};

export const runCode = async (submission) => {
  const response = await api.post('/api/coding/run', submission);
  return response.data;
};

export const submitCoding = async (submission) => {
  const response = await api.post('/api/coding/submit', submission);
  return response.data;
};

// ==================== AUDIT APIs ====================

export const startAudit = async (sessionId) => {
  const response = await api.get(`/api/audit/start/${sessionId}`);
  return response.data;
};

export const testAudit = async (submission) => {
  const response = await api.post('/api/audit/test', submission);
  return response.data;
};

export const submitAudit = async (submission) => {
  const response = await api.post('/api/audit/submit', submission);
  return response.data;
};

export default api;