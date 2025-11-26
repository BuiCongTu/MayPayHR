import { useRef, useState, useEffect, useCallback } from "react"
import { styled } from "@mui/material"

// style video
const VideoElement = styled('video')({
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  backgroundColor: '#000',
})

const CameraCapture = ({ onCapture, autoCapture = false, width = 640, height = 480 }) => {
  const videoRef = useRef(null) // video DOM
  const canvasRef = useRef(null) // canvas DOM
  const [isStreaming, setIsStreaming] = useState(false) // da bat camera
  const [error, setError] = useState(null) // loi camera
  const [capturedImage, setCapturedImage] = useState(null) // luu anh da chup

  // bat camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: width }, height: { ideal: height }, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
        setError(null)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Khong the truy cap camera. Vui long kiem tra quyen.')
    }
  }

  // tat camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      setIsStreaming(false)
    }
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  // ham chup anh
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageBase64) // luu state de preview

    // goi callback bo phan ngoai
    if (onCapture) {
      const dataOnly = imageBase64.split(',')[1] // bo prefix data:image/jpeg;base64,
      onCapture(dataOnly)
    }

    return imageBase64
  }, [onCapture])

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ position: 'relative', width, height }}>
        <VideoElement ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!isStreaming && <p style={{ textAlign: 'center' }}>Vui long bat camera...</p>}
      </div>

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        {!isStreaming ? (
          <button onClick={startCamera}>Bat Camera</button>
        ) : (
          <>
            <button onClick={captureImage}>Chup Anh</button>
            <button onClick={stopCamera}>Tat Camera</button>
          </>
        )}
      </div>

      {capturedImage && (
        <div style={{ marginTop: '20px' }}>
          <h3>Preview Anh Da Chup:</h3>
          <img src={capturedImage} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', border: '2px solid #4CAF50' }} />
        </div>
      )}

      <div style={{ marginTop: '15px', padding: '10px', borderTop: '1px solid #ccc' }}>
        <p>- Nhin thang vao camera</p>
        <p>- Dam bao du anh sang</p>
        <p>- KHONG deo khau trang</p>
      </div>
    </div>
  )
}

export default CameraCapture
