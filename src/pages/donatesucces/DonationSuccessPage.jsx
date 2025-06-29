import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import styles from './DonationSuccessPage.module.css';

// Stripe-dan gələn statusu anlamaq üçün köməkçi funksiya
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const DonationSuccessPage = () => {
    const query = useQuery();
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const paymentStatus = query.get('redirect_status');
        setStatus(paymentStatus);

        if (paymentStatus === 'succeeded') {
            setMessage('Dəstəyiniz üçün təşəkkür edirik! İanəniz uğurla qəbul edildi.');
        } else if (paymentStatus === 'processing') {
            setMessage('Ödənişiniz emal olunur. Tezliklə statusu yeniləyəcəyik.');
        } else {
            setMessage('Ödəniş zamanı xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin və ya bizimlə əlaqə saxlayın.');
        }
    }, [query]);

    if (!status) {
        return <div className={styles.container}><div className={styles.spinner}></div></div>;
    }

    const isSuccess = status === 'succeeded';

    return (
        <div className={styles.container}>
            <div className={styles.statusBox}>
                {isSuccess ? (
                    <FaCheckCircle className={`${styles.icon} ${styles.success}`} />
                ) : (
                    <FaExclamationTriangle className={`${styles.icon} ${styles.error}`} />
                )}
                <h1 className={isSuccess ? styles.successText : styles.errorText}>
                    {isSuccess ? 'Təşəkkür Edirik!' : 'Xəta Baş Verdi'}
                </h1>
                <p>{message}</p>
                <Link to="/" className={styles.homeButton}>
                    Ana Səhifəyə Qayıt
                </Link>
            </div>
        </div>
    );
};

export default DonationSuccessPage;
