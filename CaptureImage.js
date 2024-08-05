// components/CaptureImage.js
import React, { useRef } from 'react';
import { storage, firestore } from '@/firebase'; // Ensure this path is correct
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from 'firebase/firestore';
import { Button, Box } from '@mui/material';

const CaptureImage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(err => console.error('Error:', err));
  };

  const captureImage = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    canvasRef.current.toBlob(async (blob) => {
      const fileRef = ref(storage, `images/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      await addDoc(collection(firestore, 'images'), { url, timestamp: new Date() });
    }, 'image/jpeg');
  };

  return (
    <Box>
      <video ref={videoRef} style={{ width: '640px', height: '480px' }}></video>
      <Button variant="contained" onClick={startVideo}>Start Camera</Button>
      <Button variant="contained" onClick={captureImage}>Capture Image</Button>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
    </Box>
  );
};

export default CaptureImage;
