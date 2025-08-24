import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

function ChatBot() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I can help analyze your symptoms. Please describe how you\'re feeling.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await chatAPI.analyzeSymptoms(userMessage);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: response.data.analysis,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      toast.error('Failed to analyze symptoms');
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h2>Symptom Analysis Chat</h2>
      <div className="chat-disclaimer">
        <p>⚠️ This is for informational purposes only. Always consult a healthcare professional for medical advice.</p>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.text.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {message.timestamp && (
              <div className="message-time">{message.timestamp}</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBot;