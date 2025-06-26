// src/pages/DonatePage/DonatePage.jsx

import React, { useState } from 'react';
import styles from './DonatePage.module.css';
import { FaHeart, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';

// === DƏYİŞİKLİK BURADADIR ===
// 1. Öz QR kod şəklinizi assets qovluğundan import edirik.
// Faylın adının "my-qr.jpg" olduğundan əmin olun.
import qrCodeImage from '../../assets/myy-qr.jpg'; 

// Modalın ana elementini təyin edirik (Accessibility üçün vacibdir)
Modal.setAppElement('#root');

const DonatePage = () => {
    const [amount, setAmount] = useState(10);
    const predefinedAmounts = [5, 10, 20, 50];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(Number(value));
    };

    const handlePredefinedAmountClick = (predefinedAmount) => {
        setAmount(predefinedAmount);
    };

    const handleDonate = () => {
        if (amount <= 0) {
            alert("Zəhmət olmasa, düzgün məbləğ daxil edin.");
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setIsModalOpen(true);
        }, 1500);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={styles.donateContainer}>
            <div className={styles.donateBox}>
                <FaHeart className={styles.heartIcon} />
                <h2>Layihəyə Dəstək Olun</h2>
                <p>
                    StyleFolio-nun inkişafına və yeni funksiyaların əlavə olunmasına kömək etdiyiniz üçün təşəkkür edirik!
                </p>

                <div className={styles.amountSelector}>
                    {predefinedAmounts.map((preAmount) => (
                        <button
                            key={preAmount}
                            className={`${styles.amountButton} ${amount === preAmount ? styles.selected : ''}`}
                            onClick={() => handlePredefinedAmountClick(preAmount)}
                        >
                            {preAmount} AZN
                        </button>
                    ))}
                </div>

                <div className={styles.customAmount}>
                    <label htmlFor="custom-amount">Və ya öz məbləğinizi daxil edin:</label>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            id="custom-amount"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="Məbləğ"
                        />
                        <span>AZN</span>
                    </div>
                </div>

                <button 
                    className={styles.donateButton} 
                    onClick={handleDonate}
                    disabled={isLoading}
                >
                    {isLoading ? 'Yönləndirilir...' : (amount > 0 ? `${amount} AZN İanə Et` : 'İanə Et')}
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
                contentLabel="Ödəniş Simulyasiyası"
            >
                <button onClick={closeModal} className={styles.closeModalButton}><FaTimes /></button>
                <h3>Ödənişə Dəstək</h3>
                <p>Layihəmizə dəstək olmaq üçün aşağıdakı üsullardan istifadə edə bilərsiniz. Bu, diplom layihəsi üçün bir simulyasiyadır.</p>
                <div className={styles.paymentMethods}>
                    <div className={styles.qrCodeSection}>
                        <h4>QR Kodu Skan Edin</h4>
                        {/* Artıq lokal şəkil faylını göstəririk */}
                        <img src={qrCodeImage} alt="QR Kod" />
                    </div>
                    <div className={styles.cardInfoSection}>
                        <h4>Və ya Karta Köçürmə Edin</h4>
                        {/* === DƏYİŞİKLİK BURADADIR === */}
                        {/* 2. Kart məlumatlarını şəkildəkinə uyğunlaşdırırıq */}
                        <div className={styles.cardDetails}>
                            <span>Kart Nömrəsi:</span>
                            <p>4169 7388 8173 9068</p>
                            <span>Ad, Soyad:</span>
                            <p>Hacızadə Ataxan</p>
                        </div>
                    </div>
                </div>
                <button onClick={closeModal} className={styles.modalActionButton}>Başa Düşdüm</button>
            </Modal>
        </div>
    );
};

export default DonatePage;
