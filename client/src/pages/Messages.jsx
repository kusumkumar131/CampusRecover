import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Clock, QrCode, AlertCircle } from 'lucide-react';
import * as messageService from '../services/messageService';

const Messages = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // active conversation item object
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const loadConversations = async (autoSelectId = null) => {
    try {
      const response = await messageService.getConversations();
      if (response.success) {
        const chatsList = response.data;
        setConversations(chatsList);

        // If an autoSelectId (Item ID) is requested
        if (autoSelectId) {
          const selected = chatsList.find(c => c.item._id === autoSelectId);
          if (selected) {
            setActiveChat(selected);
          } else {
            // If conversation doesn't exist yet in the loaded list,
            // we can wait or construct a placeholder if needed,
            // but the reportFound call auto-sends an initial message which populates the conversation.
            // Let's refetch or pick the first one
            if (chatsList.length > 0) {
              setActiveChat(chatsList[0]);
            }
          }
        } else if (chatsList.length > 0 && !activeChat) {
          // Default to first chat on load
          setActiveChat(chatsList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If navigation state requests selecting a specific item's chat
    const targetItemId = location.state?.selectItem;
    loadConversations(targetItemId);
  }, [location]);

  const loadMessages = async () => {
    if (!activeChat) return;
    setMessagesLoading(true);
    try {
      const response = await messageService.getMessagesForConversation(activeChat.item._id);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch messages when active conversation changes
  useEffect(() => {
    loadMessages();
    
    // Set up polling for new messages in active chat
    const interval = setInterval(() => {
      if (activeChat) {
        // Quietly fetch updates
        messageService.getMessagesForConversation(activeChat.item._id)
          .then(res => {
            if (res.success) {
              setMessages(res.data);
            }
          })
          .catch(e => console.log('Polling messages silent catch'));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeChat]);

  // Scroll to bottom of message list on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    try {
      const response = await messageService.sendMessage({
        receiverId: activeChat.otherParticipant._id,
        itemId: activeChat.item._id,
        message: messageText
      });

      if (response.success) {
        // Add message locally
        setMessages(prev => [...prev, response.data.message]);
        // Reload conversations to update last message text
        loadConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Messages</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Coordinate meetups securely with owners and finders.
        </p>
      </div>

      <div className="chat-container glass">
        
        {/* Left conversations list */}
        <div className="conversations-sidebar">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-main)' }}>
            Active Chats
          </div>
          
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No active message threads. Scanning lost items starts conversations.
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map(chat => (
                <div 
                  key={chat.item._id}
                  className={`conversation-item ${activeChat?.item._id === chat.item._id ? 'active' : ''}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="conversation-avatar">
                    {chat.otherParticipant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">{chat.otherParticipant.name}</span>
                      {chat.lastMessage?.createdAt && (
                        <span className="conversation-date">
                          {new Date(chat.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.15rem' }}>
                      Item: {chat.item.name}
                    </div>
                    <div className="conversation-last-msg">
                      {chat.lastMessage?.text || 'No messages yet'}
                    </div>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <span className="bell-badge" style={{ position: 'relative', top: '15px', border: 'none' }}>
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right chat logs window */}
        <div className="chat-window">
          {activeChat ? (
            <>
              {/* Top header */}
              <div className="chat-header">
                <div className="conversation-avatar">
                  {activeChat.otherParticipant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{activeChat.otherParticipant.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Regarding: <strong>{activeChat.item.name}</strong> ({activeChat.item.itemId}) • Status: {activeChat.item.status}
                  </span>
                </div>
              </div>

              {/* Message log area */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No messages yet. Send a message to start arranging a handover.
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender._id === user?._id;
                    return (
                      <div 
                        key={msg._id}
                        className={`message-bubble ${isMe ? 'message-sent' : 'message-received'}`}
                      >
                        <p>{msg.message}</p>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          display: 'block', 
                          textAlign: isMe ? 'right' : 'left', 
                          marginTop: '0.25rem',
                          opacity: 0.7 
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input section */}
              <div className="chat-input-area">
                <form onSubmit={handleSendMessage} className="chat-form">
                  <input
                    type="text"
                    className="form-input chat-input"
                    placeholder="Type your message here..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
                    <Send size={18} />
                  </button>
                </form>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '0.5rem', textAlign: 'center' }}>
                  🔒 Communications are private. Do not share credentials.
                </p>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ color: 'var(--text-dark)' }} />
              <p>Select a chat on the left to start communicating.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Messages;
