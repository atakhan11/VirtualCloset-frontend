// src/pages/DonatePage.jsx (TAM VƏ DÜZGÜN VERSİYA)

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';
import styles from './DonatePage.module.css';
import { useTheme } from '../../context/ThemeContext'; 

const VITE_STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!VITE_STRIPE_PUBLISHABLE_KEY) {
    console.error("Stripe publishable key is not set in .env or .env.local file");
}
const stripePromise = loadStripe(VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/donation-success`,
            },
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
        }
        
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className={styles.paymentForm}>
            <PaymentElement id="payment-element" />
            <button disabled={isLoading || !stripe || !elements} id="submit" className={styles.donateButton}>
                <span id="button-text">
                    {isLoading ? <div className={styles.spinner}></div> : `Donate ${amount} AZN`}
                </span>
            </button>
            {message && <div id="payment-message" className={styles.paymentMessage}>{message}</div>}
        </form>
    );
};


const DonatePage = () => {
    const [amount, setAmount] = useState(10);
    const predefinedAmounts = [5, 10, 20, 50];
    const [clientSecret, setClientSecret] = useState("");
    const { theme } = useTheme(); 

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                const { data } = await axios.post(
                    'http://localhost:5000/api/payments/create-payment-intent',
                    { amount }
                );
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error("Failed to create PaymentIntent:", error);
            }
        };
        if (amount > 0) createPaymentIntent();
    }, [amount]);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: theme === 'light' ? '#007bff' : '#58a6ff',
            colorBackground: theme === 'light' ? '#ffffff' : '#1e1e1e',
            colorText: theme === 'light' ? '#30313d' : '#e0e0e0',
            colorDanger: '#df1b41',
            fontFamily: 'Ideal Sans, system-ui, sans-serif',
            spacingUnit: '2px',
            borderRadius: '8px',
        }
    };
    const options = { clientSecret, appearance };

    if (!VITE_STRIPE_PUBLISHABLE_KEY) {
        return (
            <div className={styles.donateContainer}>
                <div className={styles.donateBox}>
                    <h2>Configuration Error</h2>
                    <p>Stripe publishable key is not set.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.donateContainer}>
            <div className={styles.donateBox}>
                <FaHeart className={styles.heartIcon} />
                <h2>Support the Project</h2>
                <p>Thank you for your contribution to the development of StyleFolio!</p>
                
                <div className={styles.amountSelector}>
                    {predefinedAmounts.map((preAmount) => (
                        <button
                            key={preAmount}
                            className={`${styles.amountButton} ${amount === preAmount ? styles.selected : ''}`}
                            onClick={() => setAmount(preAmount)}
                        >
                            {preAmount} AZN
                        </button>
                    ))}
                </div>

                <div className={styles.customAmount}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="Amount"
                        />
                        <span>AZN</span>
                    </div>
                </div>
                
                {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm amount={amount} />
                    </Elements>
                )}
            </div>
        </div>
    );
};

export default DonatePage;