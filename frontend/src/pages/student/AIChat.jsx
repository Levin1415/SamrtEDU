import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader, Bot, User } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { sendChatMessage, transcribeAudio as transcribeAudioAPI } from '../../api/ai';

const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI tutor. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'zh', name: '中文' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'es', name: 'Español' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await sendChatMessage(
        input,
        selectedLanguage,
        messages.slice(-5).map(({ role, content }) => ({ role, content }))
      );

      const aiMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording... Click again to stop');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      setIsLoading(true);
      const data = await transcribeAudioAPI(audioBlob);
      setInput(data.text || data.transcript || '');
      toast.success('Audio transcribed successfully!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">AI Tutor</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Always here to help</p>
            </div>
          </div>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}>
                {message.role === 'user' ? (
                  <User className="text-white" size={18} />
                ) : (
                  <Bot className="text-white" size={18} />
                )}
              </div>
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="text-white" size={18} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                <Loader className="animate-spin text-gray-500" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="bg-white dark:bg-gray-800 rounded-b-2xl p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`p-3 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AIChat;
