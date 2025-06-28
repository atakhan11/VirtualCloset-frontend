// src/pages/ChatPage/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/reducers/userSlice';
import axios from 'axios';

// Firebase kitabxanaları
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, query, where, onSnapshot, 
    addDoc, serverTimestamp, orderBy, getDocs, doc, updateDoc,
} from 'firebase/firestore';

import { getDatabase, ref as dbRef, onValue,  } from "firebase/database";
import { onDisconnect, set } from "firebase/database";
import { 
    getStorage, ref, uploadBytesResumable, getDownloadURL 
} from "firebase/storage";



// İkonlar (FaStop və FaTrash əlavə edildi)
import styles from './ChatPage.module.css';
import { 
    FaPaperPlane, FaPaperclip, FaMicrophone, 
    FaThumbsUp, FaHeart, FaFire, FaLaugh, FaStop, FaTrash
} from 'react-icons/fa';
import { BsCheck, BsCheckAll } from 'react-icons/bs';

const firebaseConfig = {
    apiKey: "AIzaSyAJzMfYopaxLm-DX9L5QhUtMHgrgLnPhTo",
    authDomain: "stylefolio-e67b1.firebaseapp.com",
    projectId: "stylefolio-e67b1",
    storageBucket: "stylefolio-e67b1.firebasestorage.app",
    messagingSenderId: "267528552327",
    appId: "1:267528552327:web:6365c7bba25620c9179d22",
    measurementId: "G-4L9VBQRWW3",
    databaseURL: "https://stylefolio-e67b1-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);
// Səs yazma müddətini formatlayan köməkçi funksiya
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};


const ChatPage = () => {
    // Mövcud State-lər
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [uploadingFile, setUploadingFile] = useState(null);

    // === SƏSLİ MESAJ ÜÇÜN YENİLƏNMİŞ STATE VƏ REF-lər ===
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null); // Yazılmış səsi göndərmədən əvvəl saxlamaq üçün
    const [recordingDuration, setRecordingDuration] = useState(0); // Səs yazma müddətinin saniyəsi
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null); // Taymer üçün

     const [userStatuses, setUserStatuses] = useState({});

    const reduxUser = useSelector(selectUser);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { conversationId } = useParams();




    useEffect(() => {
        if (!reduxUser?.id) return;

        const userStatusDatabaseRef = dbRef(rtdb, '/status/' + reduxUser.id);
        const connectedRef = dbRef(rtdb, '.info/connected');

        const unsubscribe = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                onDisconnect(userStatusDatabaseRef).set({
                    isOnline: false,
                    last_seen: rtdbServerTimestamp(),
                }).catch((err) => console.error("onDisconnect quraşdırılarkən xəta:", err));

                set(userStatusDatabaseRef, {
                    isOnline: true,
                });
            }
        });

        return () => unsubscribe();
    }, [reduxUser?.id]);

    // YENİ: Bütün istifadəçilərin statuslarını izləyən useEffect
    useEffect(() => {
        const statusRef = dbRef(rtdb, '/status/');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const statuses = snapshot.val();
            setUserStatuses(statuses || {});
        });

        return () => unsubscribe();
    }, []);



    // ... (useEffect hook-ları burada dəyişməz qalır)
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
                    otherUserId: otherUserId
                };
            });
            const convos = await Promise.all(convosPromises);
            setConversations(convos);
            setLoading(false);
        });
        return () => unsubscribeConvos();
    }, [reduxUser, users]);

    useEffect(() => {
        if(conversationId && conversations.length > 0) {
            const selected = conversations.find(c => c.id === conversationId);
            setSelectedConversation(selected);
        } else {
            setSelectedConversation(null);
        }
    }, [conversationId, conversations]);

    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        };

        const messagesQuery = query(collection(db, `chats/${selectedConversation.id}/messages`), orderBy('timestamp', 'asc'));
        
        const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            
            querySnapshot.docs.forEach(doc => {
                const messageData = doc.data();
                if (messageData.senderId !== reduxUser.id && messageData.status !== 'seen') {
                    const messageRef = doc.ref;
                    updateDoc(messageRef, { status: 'seen' });
                }
            });
        });

        return () => unsubscribeMessages();
    }, [selectedConversation, reduxUser?.id]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
    
    const sendMessage = async (content, type = 'text') => {
        if (!selectedConversation || !reduxUser) return;

        await addDoc(collection(db, `chats/${selectedConversation.id}/messages`), {
            content: content,
            type: type,
            senderId: reduxUser.id,
            timestamp: serverTimestamp(),
            status: 'sent',
            reactions: {}
        });
        
        if (type === 'text') {
            setNewMessage('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !selectedConversation) return;
        setUploadingFile(file);
        const storageRef = ref(storage, `chat_images/${selectedConversation.id}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', 
            () => {}, 
            (error) => { console.error("Fayl yükləmə xətası:", error); setUploadingFile(null); }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    sendMessage(downloadURL, 'image');
                    setUploadingFile(null);
                });
            }
        );
    };

    const handleReaction = async (messageId, emoji) => {
        if (!selectedConversation) return;
        const messageRef = doc(db, `chats/${selectedConversation.id}/messages`, messageId);
        const targetMessage = messages.find(m => m.id === messageId);
        if (!targetMessage) return;
        const currentReactions = targetMessage.reactions || {};
        const userListForEmoji = currentReactions[emoji] || [];
        if (userListForEmoji.includes(reduxUser.id)) {
            currentReactions[emoji] = userListForEmoji.filter(uid => uid !== reduxUser.id);
            if (currentReactions[emoji].length === 0) {
                delete currentReactions[emoji];
            }
        } else {
            currentReactions[emoji] = [...userListForEmoji, reduxUser.id];
        }
        await updateDoc(messageRef, { reactions: currentReactions });
    };

    // === SƏSLİ MESAJ FUNKSİYALARI (YENİLƏNİB) ===
    const uploadAudio = (audioBlob) => {
        if (!selectedConversation || !audioBlob) return;
        const fileName = `audio/${selectedConversation.id}/${Date.now()}.webm`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, audioBlob);
        uploadTask.on('state_changed',
            () => {},
            (error) => console.error("Səs faylı yükləmə xətası:", error),
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    sendMessage(downloadURL, 'audio');
                });
            }
        );
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setRecordedAudio(audioBlob); // Səsi göndərmədən əvvəl state-də saxlayırıq
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setIsRecording(true);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Mikrofon icazəsi alınmadı:", err);
            alert("Səs yazmaq üçün mikrofon icazəsi verməlisiniz.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        clearInterval(recordingIntervalRef.current);
        setRecordingDuration(0);
    };

    const handleMicButtonClick = () => {
        if (!selectedConversation) return;
        if (isRecording) {
            handleStopRecording();
        } else {
            handleStartRecording();
        }
    };
    
    const handleSendAudio = () => {
        if (recordedAudio) {
            uploadAudio(recordedAudio);
            setRecordedAudio(null);
        }
    };

    const handleCancelAudio = () => {
        setRecordedAudio(null);
    };
    // === SƏSLİ MESAJ FUNKSİYALARININ SONU ===

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== '') sendMessage(newMessage, 'text');
    };

    const renderStatusIcon = (message) => {
        if (message.senderId !== reduxUser.id) return null;
        if (message.status === 'seen') return <BsCheckAll className={styles.iconSeen} />;
        if (message.status === 'delivered') return <BsCheckAll />;
        return <BsCheck />;
    };
    
    if (loading) return <div className={styles.loadingScreen}>Yüklənir...</div>;

   return (
        <div className={styles.chatPageContainer}>
            <div className={styles.sidebar}>
                 {/* Sidebar-da istifadəçilərin statusunu göstəririk */}
                 <div className={styles.userList}>
                     <h3>Yeni Söhbət</h3>
                     <ul>
                         {users.map(user => (
                             <li key={user._id} onClick={() => handleSelectUser(user)}>
                                 <span className={`${styles.statusIndicator} ${userStatuses[user._id]?.isOnline ? styles.online : ''}`}></span>
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
                                 <span className={`${styles.statusIndicator} ${userStatuses[convo.otherUserId]?.isOnline ? styles.online : ''}`}></span>
                                 {convo.otherUserName}
                             </li>
                         ))}
                     </ul>
                 </div>
            </div>

            <div className={styles.mainChatArea}>
                {/* Söhbət başlığında statusu göstəririk */}
                {!selectedConversation ? (
                    <div className={styles.chatWindowPlaceholder}>Başlamaq üçün bir istifadəçi və ya söhbət seçin.</div>
                ) : (
                    <>
                        <div className={styles.chatWindowHeader}>
                            {selectedConversation.otherUserName}
                            {userStatuses[selectedConversation.otherUserId]?.isOnline ? (
                                <span className={styles.headerStatusOnline}>Aktivdir</span>
                            ) : (
                                <span className={styles.headerStatusOffline}>Aktiv deyil</span>
                            )}
                        </div>
                        <div className={styles.messagesArea}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`${styles.messageWrapper} ${msg.senderId === reduxUser.id ? styles.sentWrapper : styles.receivedWrapper}`}>
                                    <div className={styles.messageBubble}>
                                        {msg.type === 'image' && <img src={msg.content} alt="Söhbətdən şəkil" className={styles.chatImage} />}
                                        {msg.type === 'audio' && <audio controls src={msg.content} className={styles.chatAudio}></audio>}
                                        {msg.type === 'text' && <p>{msg.content}</p>}
                                        <div className={styles.reactionPicker}>
                                            <FaThumbsUp onClick={() => handleReaction(msg.id, '👍')} />
                                            <FaHeart onClick={() => handleReaction(msg.id, '❤️')} />
                                            <FaFire onClick={() => handleReaction(msg.id, '🔥')} />
                                            <FaLaugh onClick={() => handleReaction(msg.id, '😂')} />
                                        </div>
                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                            <div className={styles.reactionsContainer}>
                                                {Object.entries(msg.reactions).map(([emoji, users]) => 
                                                    users.length > 0 ? <span key={emoji}>{emoji} {users.length}</span> : null
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.messageInfo}>
                                        <span className={styles.messageTimestamp}>
                                            {msg.timestamp?.toDate().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {renderStatusIcon(msg)}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className={styles.messageInputArea}>
                            {recordedAudio ? (
                                <div className={styles.audioPreview}>
                                    <button type="button" className={styles.iconButton} onClick={handleCancelAudio}><FaTrash /></button>
                                    <audio controls src={URL.createObjectURL(recordedAudio)} className={styles.previewAudioPlayer}></audio>
                                    <button type="button" className={styles.sendButton} onClick={handleSendAudio}><FaPaperPlane /></button>
                                </div>
                            ) : isRecording ? (
                                <div className={styles.recordingIndicator}>
                                    <button type="button" className={`${styles.iconButton} ${styles.recording}`} onClick={handleMicButtonClick}><FaStop /></button>
                                    <span>Səs yazılır... {formatDuration(recordingDuration)}</span>
                                </div>
                            ) : (
                                <form className={styles.textInputForm} onSubmit={handleSubmit}>
                                    <button type="button" className={styles.iconButton} onClick={() => fileInputRef.current.click()}><FaPaperclip /></button>
                                    <button type="button" className={styles.iconButton} onClick={handleMicButtonClick}><FaMicrophone /></button>
                                    <input
                                        type="text"
                                        className={styles.messageInput}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Mesajınızı yazın..."
                                        disabled={uploadingFile}
                                    />
                                    <button type="submit" className={styles.sendButton} aria-label="Göndər" disabled={uploadingFile}><FaPaperPlane /></button>
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                                </form>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
