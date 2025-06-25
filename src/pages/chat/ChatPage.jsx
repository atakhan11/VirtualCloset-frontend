import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/reducers/userSlice';
import axios from 'axios';

// Firebase kitabxanalarını import edirik
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, query, where, onSnapshot, 
    addDoc, serverTimestamp, orderBy, getDocs
} from 'firebase/firestore';

import styles from './ChatPage.module.css';
import { FaPaperPlane } from 'react-icons/fa'; // Göndər ikonu üçün

// DİQQƏT: Bu konfiqurasiyanı öz Firebase məlumatlarınızla əvəz edin
const firebaseConfig = {
    apiKey: "AIzaSyAJzMfYopaxLm-DX9L5QhUtMHgrgLnPhTo",
  authDomain: "stylefolio-e67b1.firebaseapp.com",
  projectId: "stylefolio-e67b1",
  storageBucket: "stylefolio-e67b1.firebasestorage.app",
  messagingSenderId: "267528552327",
  appId: "1:267528552327:web:6365c7bba25620c9179d22",
  measurementId: "G-4L9VBQRWW3"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const ChatPage = () => {
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    
    const reduxUser = useSelector(selectUser);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { conversationId } = useParams();

    // Çat üçün istifadəçi siyahısını backend-dən çəkirik
    useEffect(() => {
        if (reduxUser) {
            const fetchUsers = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const { data } = await axios.get('http://localhost:5000/api/users/chatlist', config);
                    setUsers(data);
                } catch (error) {
                    console.error("Çat üçün istifadəçiləri yükləmək mümkün olmadı:", error);
                }
            };
            fetchUsers();
        }
    }, [reduxUser]);

    // İstifadəçinin söhbətlərini real-zamanlı dinləyirik
    useEffect(() => {
        if (!reduxUser || users.length === 0) return;
        const q = query(collection(db, "chats"), where('participants', 'array-contains', reduxUser.id));
        const unsubscribeConvos = onSnapshot(q, async (querySnapshot) => {
            const convosPromises = querySnapshot.docs.map(async (doc) => {
                const convoData = doc.data();
                const otherUserId = convoData.participants.find(uid => uid !== reduxUser.id);
                const otherUser = users.find(u => u._id === otherUserId);
                return { 
                    id: doc.id, 
                    ...convoData,
                    otherUserName: otherUser?.name || 'Naməlum istifadəçi',
                };
            });
            const convos = await Promise.all(convosPromises);
            setConversations(convos);
            setLoading(false);
        });
        return () => unsubscribeConvos();
    }, [reduxUser, users]);

    // URL dəyişdikdə, seçilmiş söhbəti yeniləyirik
    useEffect(() => {
        if(conversationId && conversations.length > 0) {
            const selected = conversations.find(c => c.id === conversationId);
            setSelectedConversation(selected);
        } else {
            setSelectedConversation(null);
        }
    }, [conversationId, conversations]);

    // Seçilmiş söhbətin mesajlarını real-zamanlı dinləyirik
    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        };
        const messagesQuery = query(collection(db, `chats/${selectedConversation.id}/messages`), orderBy('timestamp', 'asc'));
        const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });
        return () => unsubscribeMessages();
    }, [selectedConversation]);

    // === DÜZƏLİŞ: Daha etibarlı scroll məntiqi ===
    useEffect(() => {
        const messageContainer = messagesEndRef.current?.parentElement;
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, [messages]);


    // Yeni söhbət başlatmaq və ya mövcuda keçmək
    const handleSelectUser = async (user) => {
        if (!reduxUser) return;
        const participants = [reduxUser.id, user._id].sort();
        const q = query(collection(db, "chats"), where('participants', '==', participants));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            navigate(`/chat/${querySnapshot.docs[0].id}`);
        } else {
            const newConvoRef = await addDoc(collection(db, "chats"), {
                participants: participants,
                participantNames: [reduxUser.name, user.name].sort(),
                createdAt: serverTimestamp()
            });
            navigate(`/chat/${newConvoRef.id}`);
        }
    };
    
    // Yeni mesaj göndərmək
    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !selectedConversation || !reduxUser) return;
        await addDoc(collection(db, `chats/${selectedConversation.id}/messages`), {
            text: newMessage,
            senderId: reduxUser.id,
            timestamp: serverTimestamp()
        });
        setNewMessage('');
    };
    
    // Formun göndərilməsini idarə edən funksiya
    const handleSubmit = (e) => {
        e.preventDefault(); // Səhifənin yenilənməsinin və scroll olmasının qarşısını alır
        handleSendMessage();
    };
    
    if (loading) return <div className={styles.loadingScreen}>Yüklənir...</div>;

    return (
        <div className={styles.chatPageContainer}>
            <div className={styles.sidebar}>
                <div className={styles.userList}>
                    <h3>Yeni Söhbət</h3>
                    <ul>
                        {users.map(user => (
                            <li key={user._id} onClick={() => handleSelectUser(user)}>
                                {user.name}
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className={styles.conversationList}>
                    <h3>Söhbətlərim</h3>
                    <ul>
                        {conversations.map(convo => (
                            <li 
                                key={convo.id} 
                                className={convo.id === selectedConversation?.id ? styles.selected : ''}
                                onClick={() => navigate(`/chat/${convo.id}`)}
                            >
                                {convo.otherUserName}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className={styles.mainChatArea}>
                 {!selectedConversation ? (
                    <div className={styles.chatWindowPlaceholder}>Başlamaq üçün bir istifadəçi və ya söhbət seçin.</div>
                ) : (
                    <>
                        <div className={styles.chatWindowHeader}>{selectedConversation.otherUserName}</div>
                        <div className={styles.messagesArea}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`${styles.messageBubble} ${msg.senderId === reduxUser.id ? styles.sent : styles.received}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className={styles.messageInputArea} onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Mesajınızı yazın..."
                            />
                            <button type="submit" className={styles.sendButton} aria-label="Göndər">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
