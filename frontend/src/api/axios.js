import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // #region agent log
    fetch('http://127.0.0.1:7894/ingest/98cc3b66-e588-4eda-b3c4-a74dfe885cfd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d379c9'},body:JSON.stringify({sessionId:'d379c9',runId:'pre-fix',hypothesisId:'H3',location:'frontend/src/api/axios.js:request',message:'axios request',data:{method:config.method,url:config.url,baseURL:config.baseURL,hasAuthHeader:!!(config.headers && (config.headers.Authorization || config.headers.authorization))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // #region agent log
    fetch('http://127.0.0.1:7894/ingest/98cc3b66-e588-4eda-b3c4-a74dfe885cfd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d379c9'},body:JSON.stringify({sessionId:'d379c9',runId:'pre-fix',hypothesisId:'H3',location:'frontend/src/api/axios.js:response',message:'axios response',data:{status:response.status,url:response.config?.url,baseURL:response.config?.baseURL},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
    return response;
  },
  (error) => {
    // #region agent log
    fetch('http://127.0.0.1:7894/ingest/98cc3b66-e588-4eda-b3c4-a74dfe885cfd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d379c9'},body:JSON.stringify({sessionId:'d379c9',runId:'pre-fix',hypothesisId:'H3',location:'frontend/src/api/axios.js:error',message:'axios error',data:{status:error.response?.status,url:error.config?.url,baseURL:error.config?.baseURL,detailType:typeof error.response?.data?.detail,detailLen:typeof error.response?.data?.detail==='string'?error.response.data.detail.length:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
