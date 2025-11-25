import axios from 'axios';
import { useState } from 'react';
import CameraCapture from '../../../components/attendance/CameraCapture';
import alert from "bootstrap/js/src/alert";

const CheckOutPage = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCapture = async (imageBase64) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/api/attendance/checkout', {
                imageBase64
            });

            if (response.data.success) {
                setResult(response.data);
                alert('success', `GoodBye ${response.data.fullName}. Check-out at ${response.data.timeIn}`);
            } else {
                setError(response.data.message);
            }
        } catch (e) {
            const errorMessage = e.response?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
            alert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    }

    //reset
    const reset = () => {
        setResult(null);
        setError(null);
    }
    const formatWorkingHours = (hours) => {
        if (!hours) return 'N/A';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    return (
        <div>
            <div>
                <h1>Check-Out</h1>
            </div>

            {!result ? (
                <>
                    <CameraCapture onCapture={handleCapture} autoCapture={false}/>
                    {loading && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                            <p>Scanning face...</p>
                        </div>
                    )}
                {error && (
                    <div className="error-box">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button onClick={reset}>Try Again</button>
                    </div>
                    )}
                </>
                ) : (
                    <div className="success-box">
                        <div className="success-icon"></div>
                        <h2>Check-Out Successful!</h2>
                        <div className="info-grid">
                            <h2>Check Out Successfully!</h2>
                            <div className="info-item">
                                <span className="info-label">Employee:</span>
                                <span className="info-value">{result.fullName}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Date:</span>
                                <span className="info-value">{result.date}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Check in:</span>
                                <span className="info-value">{result.timeIn}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Check Out:</span>
                                <span className="info-value">{result.timeOut}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Total working hour:</span>
                                <span className="info-label">
                                {formatWorkingHours(result.workingHours)}
                              </span>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button onClick={reset} className="done-button">
                                Done
                            </button>
                            <a href="/attendance/history" className="history-link">
                                View History
                            </a>
                        </div>
                    </div>
                )}
        </div>
    );
}
export default CheckOutPage;