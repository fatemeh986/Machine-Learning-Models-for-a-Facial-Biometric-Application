import {useState, useRef} from "react"
import { io, Socket } from "socket.io-client";
import "./FaceExpression.scss"


const FaceExpression = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [emotions, setEmotions] = useState<Record<string, number> | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [facePosition, setFacePosition] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<number | null>(null);


  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video : true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMediaStream(stream);
        setIsRunning(true);
        startSocketConnection();
      }
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  // function for stop webcam
  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => 
        track.stop());
        setMediaStream(null);
      }
      stopSocketConnection();
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setIsRunning(false);
  };

  // send video frame to backend
  const sendFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const frame = canvas.toDataURL("image/jpeg");
        socketRef.current?.emit("video_frame", {frame_data: frame, user: 1})
      }
    }
  };

  


  const startSocketConnection = (): void => {

      socketRef.current = io("http://localhost:21100") as Socket;
    
      socketRef.current.on("connect", (): void => {
        console.log("Connected to server");
      });
    
      socketRef.current.on("disconnect", (): void => {
        console.log("Disconnected from server");
      });
    
      socketRef.current.on(
        "emotion_update",
        (data: { emotions: Record<string, number>; face_position: string; }) => {
          setEmotions(data.emotions);
          setFacePosition(data.face_position);
        }
      );
      intervalRef.current = setInterval(sendFrame, 1000)
    };


  const stopSocketConnection = (): void => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

  

  return (
    
    <div className="WebcamContainer">
      <div>
        {!isRunning ? (
          <button className="verify-btn" onClick={startWebcam}> Start Webcam</button>
        ) : (
          <button className="verify-btn" onClick={stopWebcam}>Stop Webcam</button>
        )}
      </div>

      <video ref={videoRef} autoPlay muted className="WebcamVideo"/>
      <canvas ref={canvasRef} className="WebcamCanvas"/>

      {emotions && (
        <div className="emotion-display">
          <h3>Detected Emotions:</h3>
          <pre>{JSON.stringify(emotions, null, 2)}</pre>
          <h4>Face Position: {facePosition}</h4>
        </div>
      )}
    </div>
    );
  };


export default FaceExpression