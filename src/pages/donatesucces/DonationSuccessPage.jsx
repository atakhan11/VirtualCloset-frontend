import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import styles from './DonationSuccessPage.module.css';

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
            setMessage('Thank you for your support! Your donation was successfully received.');
        } else if (paymentStatus === 'processing') {
            setMessage('Your payment is being processed. We will update the status shortly.');
        } else {
            setMessage('An error occurred during payment. Please try again or contact us.');
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
                    {isSuccess ? 'Thank You!' : 'An Error Occurred'}
                </h1>
                <p>{message}</p>
                <Link to="/" className={styles.homeButton}>
                    Return to Home Page
                </Link>
            </div>
        </div>
    );
};

export default DonationSuccessPage;