import { useState } from 'react';
import requestPermission from '../utils/requestPermission.js';

/**
 * FCM Token Generator Component
 * Use this component to easily generate and display FCM tokens for testing
 */
function FCMTokenGenerator() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerateToken = async () => {
        setLoading(true);
        setError(null);
        setCopied(false);

        try {
            const fcmToken = await requestPermission();
            if (fcmToken) {
                setToken(fcmToken);
            } else {
                setError('Failed to generate token. Please allow notifications.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>🔔 FCM Token Generator</h2>

            <button
                onClick={handleGenerateToken}
                disabled={loading}
                style={styles.button}
            >
                {loading ? 'Generating...' : 'Generate FCM Token'}
            </button>

            {error && (
                <div style={styles.error}>
                    ❌ {error}
                </div>
            )}

            {token && (
                <div style={styles.tokenContainer}>
                    <div style={styles.successMessage}>
                        ✅ Token Generated Successfully!
                    </div>

                    <div style={styles.tokenBox}>
                        <code style={styles.tokenText}>{token}</code>
                    </div>

                    <button
                        onClick={handleCopyToken}
                        style={styles.copyButton}
                    >
                        {copied ? '✓ Copied!' : '📋 Copy Token'}
                    </button>

                    <div style={styles.info}>
                        💡 Use this token to send test notifications from Firebase Console
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '600px',
        margin: '40px auto',
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '24px',
    },
    button: {
        width: '100%',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#4285f4',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    error: {
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#fee',
        color: '#c33',
        borderRadius: '6px',
        textAlign: 'center',
    },
    tokenContainer: {
        marginTop: '24px',
    },
    successMessage: {
        padding: '12px',
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '6px',
        textAlign: 'center',
        marginBottom: '16px',
    },
    tokenBox: {
        padding: '16px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        marginBottom: '16px',
        maxHeight: '120px',
        overflow: 'auto',
    },
    tokenText: {
        fontSize: '12px',
        color: '#333',
        wordBreak: 'break-all',
        fontFamily: 'monospace',
    },
    copyButton: {
        width: '100%',
        padding: '12px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#28a745',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginBottom: '16px',
    },
    info: {
        padding: '12px',
        backgroundColor: '#e7f3ff',
        color: '#004085',
        borderRadius: '6px',
        fontSize: '14px',
        textAlign: 'center',
    },
};

export default FCMTokenGenerator;
