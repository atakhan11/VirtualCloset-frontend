import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// DÜZƏLİŞ: selectUser-i düzgün yoldan import edirik
import { selectUser } from '../../redux/reducers/userSlice'; 
import axios from 'axios';

// Firebase kitabxanaları
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, query, where, onSnapshot, 
    addDoc, serverTimestamp as firestoreServerTimestamp, orderBy, getDocs, doc, updateDoc,
} from 'firebase/firestore';
import { 
    getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL 
} from "firebase/storage";
import { 
    getDatabase, ref as dbRef, onValue, onDisconnect, set, serverTimestamp as rtdbServerTimestamp 
} from "firebase/database";

// Tarix formatlaması üçün kitabxana
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { az } from 'date-fns/locale';

import styles from './ChatPage.module.css';
import { 
    FaPaperPlane, FaPaperclip, FaMicrophone, 
    FaThumbsUp, FaHeart, FaFire, FaLaugh, FaStop, FaTrash, FaSmile
} from 'react-icons/fa';
import { BsCheck, BsCheckAll } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

const firebaseConfig = {
    apiKey: "AIzaSyAJzMfYopaxLm-DX9L5QhUtMHgrgLnPhTo",
    authDomain: "stylefolio-e67b1.firebaseapp.com",
    projectId: "stylefolio-e67b1",
    storageBucket: "stylefolio-e67b1.firebasestorage.app",
    messagingSenderId: "267528552327",
    appId: "1:267528552327:web:6365c7bba25620c9179d22",
    measurementId: "G-4L9VBQRWW3",
    databaseURL: "https://stylefolio-e67b1-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'bir müddət əvvəl';
    const date = new Date(timestamp);
    const now = new Date();
    
    const diffSeconds = (now.getTime() - date.getTime()) / 1000;
    if (diffSeconds < 60) return 'indicə';

    if (diffSeconds < 3600) {
        return formatDistanceToNow(date, { addSuffix: true, locale: az });
    }
    if (isToday(date)) return `bu gün, ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `dünən, ${format(date, 'HH:mm')}`;
    
    return format(date, 'd MMM, HH:mm', { locale: az });
};


const ChatPage = () => {
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [uploadingFile, setUploadingFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [userStatuses, setUserStatuses] = useState({});
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const typingTimeoutRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const reduxUser = useSelector(selectUser);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { conversationId } = useParams();

    // DÜZƏLİŞ: Bütün 'reduxUser.id' istifadələri 'reduxUser._id' ilə əvəz edildi
    const currentUserId = reduxUser?._id;

    useEffect(() => {
        if (!currentUserId) return;
        const userStatusDatabaseRef = dbRef(rtdb, '/status/' + currentUserId);
        const connectedRef = dbRef(rtdb, '.info/connected');
        const unsubscribe = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                onDisconnect(userStatusDatabaseRef).set({
                    isOnline: false,
                    last_seen: rtdbServerTimestamp(),
                }).catch((err) => console.error("onDisconnect quraşdırılarkən xəta:", err));
                set(userStatusDatabaseRef, {
                    isOnline: true,
                }).catch(err => console.error("Status təyin edilərkən xəta:", err));
            }
        });
        return () => unsubscribe();
    }, [currentUserId]);

    useEffect(() => {
        const statusRef = dbRef(rtdb, '/status/');
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const statuses = snapshot.val();
            setUserStatuses(statuses || {});
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        if (!selectedConversation || !currentUserId) return;
        const otherUserId = selectedConversation.participants.find(uid => uid !== currentUserId);
        if (!otherUserId) return;
        const typingRef = dbRef(rtdb, `typing/${selectedConversation.id}/${otherUserId}`);
        const unsubscribe = onValue(typingRef, (snapshot) => {
            setIsOtherUserTyping(snapshot.val() === true);
        });
        return () => {
            unsubscribe();
            const myTypingRef = dbRef(rtdb, `typing/${selectedConversation.id}/${currentUserId}`);
            set(myTypingRef, null);
        };
    }, [selectedConversation, currentUserId]);

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
        if (!currentUserId || users.length === 0) return;
        const q = query(collection(db, "chats"), where('participants', 'array-contains', currentUserId));
        const unsubscribeConvos = onSnapshot(q, async (querySnapshot) => {
            const convosPromises = querySnapshot.docs.map(async (doc) => {
                const convoData = doc.data();
                const otherUserId = convoData.participants.find(uid => uid !== currentUserId);
                const otherUser = users.find(u => u._id === otherUserId);
                return { 
                    id: doc.id, ...convoData,
                    otherUserName: otherUser?.name || 'Naməlum istifadəçi',
                    otherUserId: otherUserId
                };
            });
            const convos = await Promise.all(convosPromises);
            setConversations(convos);
            setLoading(false);
        });
        return () => unsubscribeConvos();
    }, [currentUserId, users]);

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
                if (messageData.senderId !== currentUserId && messageData.status !== 'seen') {
                    const messageRef = doc.ref;
                    updateDoc(messageRef, { status: 'seen' });
                }
            });
        });
        return () => unsubscribeMessages();
    }, [selectedConversation, currentUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectUser = async (user) => {
        if (!currentUserId) return;
        const participants = [currentUserId, user._id].sort();
        const q = query(collection(db, "chats"), where('participants', '==', participants));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            navigate(`/chat/${querySnapshot.docs[0].id}`);
        } else {
            const newConvoRef = await addDoc(collection(db, "chats"), {
                participants: participants,
                participantNames: [reduxUser.name, user.name].sort(),
                createdAt: firestoreServerTimestamp()
            });
            navigate(`/chat/${newConvoRef.id}`);
        }
    };
    
    const sendMessage = async (content, type = 'text') => {
        if (!selectedConversation || !currentUserId) return;
        await addDoc(collection(db, `chats/${selectedConversation.id}/messages`), {
            content: content, type: type, senderId: currentUserId,
            timestamp: firestoreServerTimestamp(), status: 'sent', reactions: {}
        });
        if (type === 'text') { setNewMessage(''); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !selectedConversation) return;
        setUploadingFile(file);
        const fileStorageRef = storageRef(storage, `chat_images/${selectedConversation.id}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileStorageRef, file);
        uploadTask.on('state_changed', () => {}, (error) => { console.error("Fayl yükləmə xətası:", error); setUploadingFile(null); }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                sendMessage(downloadURL, 'image');
                setUploadingFile(null);
            });
        });
    };

    const handleReaction = async (messageId, emoji) => {
        if (!selectedConversation) return;
        const messageRef = doc(db, `chats/${selectedConversation.id}/messages`, messageId);
        const targetMessage = messages.find(m => m.id === messageId);
        if (!targetMessage) return;
        const currentReactions = targetMessage.reactions || {};
        const userListForEmoji = currentReactions[emoji] || [];
        if (userListForEmoji.includes(currentUserId)) {
            currentReactions[emoji] = userListForEmoji.filter(uid => uid !== currentUserId);
            if (currentReactions[emoji].length === 0) {
                delete currentReactions[emoji];
            }
        } else {
            currentReactions[emoji] = [...userListForEmoji, currentUserId];
        }
        await updateDoc(messageRef, { reactions: currentReactions });
    };

    const uploadAudio = (audioBlob) => {
        if (!selectedConversation || !audioBlob) return;
        const fileName = `audio/${selectedConversation.id}/${Date.now()}.webm`;
        const audioStorageRef = storageRef(storage, fileName);
        const uploadTask = uploadBytesResumable(audioStorageRef, audioBlob);
        uploadTask.on('state_changed', () => {}, (error) => console.error("Səs faylı yükləmə xətası:", error), () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                sendMessage(downloadURL, 'audio');
            });
        });
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
                setRecordedAudio(audioBlob);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== '') sendMessage(newMessage, 'text');
    };

    const renderStatusIcon = (message) => {
        if (message.senderId !== currentUserId) return null;
        if (message.status === 'seen') return <BsCheckAll className={styles.iconSeen} />;
        return <BsCheckAll />;
    };

    const updateTypingStatus = useCallback(() => {
        if (!selectedConversation || !currentUserId) return;
        const typingRef = dbRef(rtdb, `typing/${selectedConversation.id}/${currentUserId}`);
        set(typingRef, true);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            set(typingRef, null);
        }, 2000);
    }, [selectedConversation, currentUserId]);

    const handleNewMessageChange = (e) => {
        setNewMessage(e.target.value);
        updateTypingStatus();
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prevInput => prevInput + emojiObject.emoji);
        setShowEmojiPicker(false);
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
                {!selectedConversation ? (
                    <div className={styles.chatWindowPlaceholder}>Başlamaq üçün bir istifadəçi və ya söhbət seçin.</div>
                ) : (
                    <>
                        <div className={styles.chatWindowHeader}>
                            <div className={styles.headerUserInfo}>
                                <span className={styles.headerUserName}>{selectedConversation.otherUserName}</span>
                                {isOtherUserTyping ? (
                                    <span className={styles.typingIndicator}>Yazır...</span>
                                ) : userStatuses[selectedConversation.otherUserId]?.isOnline ? (
                                    <span className={styles.headerStatusOnline}>Aktivdir</span>
                                ) : (
                                    <span className={styles.headerStatusOffline}>
                                        Son görülmə: {formatLastSeen(userStatuses[selectedConversation.otherUserId]?.last_seen)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={styles.messagesArea}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`${styles.messageWrapper} ${msg.senderId === currentUserId ? styles.sentWrapper : styles.receivedWrapper}`}>
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
                            {showEmojiPicker && (
                                <div className={styles.emojiPickerContainer}>
                                    <EmojiPicker onEmojiClick={onEmojiClick} pickerStyle={{ width: '100%' }} />
                                </div>
                            )}
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
                                    <button type="button" className={styles.iconButton} onClick={() => setShowEmojiPicker(!showEmojiPicker)}><FaSmile /></button>
                                    <input
                                        type="text"
                                        className={styles.messageInput}
                                        value={newMessage}
                                        onChange={handleNewMessageChange}
                                        placeholder="Mesajınızı yazın..."
                                        disabled={uploadingFile}
                                        onFocus={() => setShowEmojiPicker(false)}
                                    />
                                    <button type="button" className={styles.iconButton} onClick={handleMicButtonClick}><FaMicrophone /></button>
                                    <button type="submit" className={styles.sendButton} aria-label="Göndər" disabled={!newMessage.trim() || uploadingFile}><FaPaperPlane /></button>
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
