import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCommentDots, FaPaperPlane, FaTimes } from 'react-icons/fa';
import './Chat.css';

const Chat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'ai', text: 'Salam! Mən sizin fərdi stil məsləhətçinizəm. Bu gün sizə necə kömək edə bilərəm?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [wardrobe, setWardrobe] = useState([]);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (isOpen && wardrobe.length === 0) {
            const fetchWardrobe = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.get('http://localhost:5000/api/clothes', config);
                    setWardrobe(data);
                } catch (error) {
                    console.error("Qarderobu yükləmək mümkün olmadı:", error);
                }
            };
            fetchWardrobe();
        }
    }, [isOpen, wardrobe.length]);


    const handleSendMessage = async () => {
        const userMessage = input.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const requestBody = {
                question: userMessage,
                clothes: wardrobe,
            };

            const { data } = await axios.post('http://localhost:5000/api/ai/style-advice', requestBody, config);
            setMessages(prev => [...prev, { from: 'ai', text: data.answer }]);

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Üzr istəyirəm, bir xəta baş verdi.';
            setMessages(prev => [...prev, { from: 'ai', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            {/* Pəncərə artıq həmişə render olunur, sadəcə CSS ilə gizlədilir/göstərilir */}
            <div className={`chat-window ${isOpen ? 'open' : 'closed'}`}>
                <div className="chat-header">
                    <h3>AI Stil Məsləhətçisi</h3>
                </div>
                <div className="chat-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.from}`}>
                            {msg.text}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="message-bubble ai loading">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-area">
                    <input 
                        type="text" 
                        placeholder="Sualınızı yazın..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading}>
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
            
            {/* Bu düymə artıq həm açır, həm də bağlayır */}
            <button className="chat-bubble" onClick={() => setIsOpen(!isOpen)} aria-label="Çatı aç/bağla">
                {isOpen ? <FaTimes /> : <FaCommentDots />}
            </button>
        </div>
    );
};

export default Chat;
