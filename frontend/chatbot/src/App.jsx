import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!conversationId) {
      setConversationId(() => Date.now().toString());
    }
  }, [conversationId]);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (message.trim() === '') return;

    setLoading(true);
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: 'user', text: message },
    ]);

    try {
      const response = await fetch(`https://chatbot-using-fastapi-2.onrender.com/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error with API request: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: data.response },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: `Sorry, there was an error: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
       <div className="chat-header"> Chatbot </div>
      <div className="chat-history" ref={chatContainerRef}>
        {chatHistory.map((chat, index) => (
  <div key={index} className={`chat-message ${chat.sender}`}>
    {chat.sender === 'ai' && <div className="avatar"></div>}
    <div className="chat-text">{chat.text}</div>
  </div>
))}

      </div>
      <form onSubmit={sendMessage} className="chat-input-form">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message here"
        disabled={loading}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
          }
        }}
        className="chat-textarea"
      />
      <button type="submit" disabled={loading} className="send-button">
        {loading ? '...' : '▶'}
      </button>
    </form>

    </div>
  );
};

export default App;
