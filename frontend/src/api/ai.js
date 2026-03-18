import api from './axios';

export const sendChatMessage = async (message, language, history) => {
  // #region agent log
  fetch('http://127.0.0.1:7894/ingest/98cc3b66-e588-4eda-b3c4-a74dfe885cfd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d379c9'},body:JSON.stringify({sessionId:'d379c9',runId:'pre-fix',hypothesisId:'H3',location:'frontend/src/api/ai.js:sendChatMessage',message:'sendChatMessage called',data:{messageLen:typeof message==='string'?message.length:null,language,historyLen:Array.isArray(history)?history.length:null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion agent log
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
