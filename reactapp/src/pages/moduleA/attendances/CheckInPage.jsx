import axios from 'axios';
import { useState } from 'react';
import CameraCapture from '../../../components/attendance/CameraCapture';
import alert from "bootstrap/js/src/alert";

const CheckInPage = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCapture = async (imageBase64) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/api/face-scan/attendance', {
                imageBase64
            });

            if (response.data.success) {
                setResult(response.data);
                alert('sucess', `Hello ${response.data.fullName}. Check-in successfully at ${response.data.timeIn}`);
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

    return (
        <div>
            <h1>Check-In</h1>
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
                    <h2>Check-In Successful!</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Employee:</span>
                            <span className="info-value">{result.fullName}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Time In:</span>
                            <span className="info-value">{result.timeIn}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Date:</span>
                            <span className="info-value">{result.date}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Status:</span>
                            <span className="info-value" style={{color: result.status === 'SUCCESS' ? 'blue' : 'red'}}>
                            {result.status === 'SUCCESS' ? 'On time' : 'Late'}
                        </span>
                        </div>
                    </div>
                    <div className="actions">
                        <button onClick={reset}>Done</button>
                        <a href="/attendance/history" className="history-link">View History</a>
                    </div>
                </div>
            )}
        </div>
    );
}
export default CheckInPage;