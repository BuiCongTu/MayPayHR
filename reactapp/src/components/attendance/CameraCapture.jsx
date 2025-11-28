import {useEffect, useRef, useState} from "react";
import {styled} from "@mui/material";

const CameraCapture = ({ onCapture, autoCapture = false, width = 640, height = 480 }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const [faceDetected, setFaceDetected] = useState(false);

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: width },
                    height: { ideal: height },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                setError(null);
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Cannot access camera. Please check your permissions and try again.');
        }
    }

    async function stopCamera() {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            setIsStreaming(false);
        }
    }
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

        if (onCapture) {
          onCapture(imageBase64);
        }

        return imageBase64;
      };

    const handleManualCapture = () => {
        captureImage();
    }

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <video ref={videoRef} autoPlay playsInline style={styled.video}
                       onLoadedMetadata={() => setFaceDetected(true)}/>
                {isStreaming && <canvas ref={canvasRef} style={{ display: 'none' }}/>}
            </div>
            <div>
                {!isStreaming && (
                    <button onClick={startCamera} style={{ marginTop: '10px' }}>Start Camera</button>
                )}
                {onCapture && (
                    <button onClick={captureImage} style={{ marginTop: '10px' }}>Capture Image</button>
                )}
                {onCapture && (
                    <button onClick={stopCamera} style={{ marginTop: '10px' }}>Stop Camera</button>
                )}
            </div>

            <div>
                <img src={captureImage()} alt="Captured" style={{ maxWidth: '100%', height: 'auto' }}/>
            </div>
            <div>
                <p>- Nhìn thẳng vào camera</p>
                <p>- Đảm bảo đủ ánh sáng</p>
                <p>- KHÔNG đeo khẩu trang</p>
            </div>

        </div>
    );
}
export default CameraCapture;
