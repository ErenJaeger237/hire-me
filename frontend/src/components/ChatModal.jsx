import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('hire_me_token')}`
  }
});

export default function ChatModal({ booking, isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = API_BASE_URL.replace('/api', '');

  useEffect(() => {
    if (!isOpen || !booking) return;

    // Connect socket
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Chat socket connected:', socketRef.current.id);
      socketRef.current.emit('joinRoom', booking.id);
    });

    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 100);
    });

    const getAuthHeaders = () => {
      const token = localStorage.getItem('hire_me_token');
      return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/bookings/${booking.id}/messages`, getAuthHeaders());
        setMessages(res.data.messages);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isOpen, booking]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const getAuthHeaders = () => {
      const token = localStorage.getItem('hire_me_token');
      return { headers: { Authorization: `Bearer ${token}` } };
    };

    try {
      await axios.post(`${API_BASE_URL}/bookings/${booking.id}/messages`, {
        content: newMessage,
      }, getAuthHeaders());
      setNewMessage('');
      // We don't fetch messages, the socket will broadcast it back to us, 
      // or we rely on the DB. Let's just let the socket handle it, or add optimistically.
      // Actually, since we emit to the room, the sender also receives it.
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!isOpen || !booking) return null;

  const chatPartnerName = currentUser.role === 'CLIENT' 
    ? booking.provider?.user?.name 
    : booking.client?.name || 'Client';

  const chatPartnerPic = currentUser.role === 'CLIENT'
    ? booking.provider?.user?.profile_picture_url
    : booking.client?.profile_picture_url;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-bright w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <header className="px-6 py-4 bg-primary text-on-primary flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-bright/20 flex items-center justify-center text-on-primary overflow-hidden">
              {chatPartnerPic ? (
                <img src={chatPartnerPic} alt={chatPartnerName} className="w-full h-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <h2 className="font-bold text-base">{chatPartnerName}</h2>
              <p className="text-xs opacity-90">{booking.status} Booking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </header>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface space-y-4 flex flex-col">
          {loading ? (
            <div className="text-center text-sm text-on-surface-variant my-auto">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-on-surface-variant my-auto bg-surface-container p-6 rounded-xl border border-outline">
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    isMine 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline'
                  }`}>
                    <p>{msg.content}</p>
                    <span className={`text-[10px] block mt-1 ${isMine ? 'text-on-primary/70 text-right' : 'text-on-surface-variant'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-4 bg-surface-bright border-t border-outline">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-surface-container px-4 py-3 rounded-full text-sm outline-none border border-outline focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 hover:bg-opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
