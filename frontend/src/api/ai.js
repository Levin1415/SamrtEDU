import api from './axios';

export const sendChatMessage = async (message, language, history) => {
  const response = await api.post('/ai/chat', { message, language, history });
  return response.data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.wav');
  const response = await api.post('/ai/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const detectQuestionType = async (question) => {
  const response = await api.post('/ai/detect-question-type', { question });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get('/ai/chat-history');
  return response.data;
};

export const clearChatHistory = async () => {
  const response = await api.delete('/ai/chat-history');
  return response.data;
};
