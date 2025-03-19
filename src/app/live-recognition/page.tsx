"use client";

import { useEffect, useRef, useState } from "react";

export default function LiveRecognition() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [attendanceChecks, setAttendanceChecks] = useState<number>(0);
  const [successfulDetections, setSuccessfulDetections] = useState<number>(0);

  useEffect(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setIsStreaming(true);
          startRandomCapture(); // Start capturing at random intervals
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err);
          setMessage("Unable to access webcam.");
        });
    } else {
      setMessage("Webcam not supported.");
    }
  }, []);

  // Function to generate a random interval between 5-10 seconds
  const getRandomInterval = () => Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

  // Function to start capturing frames at random intervals
  const startRandomCapture = () => {
    const captureFrame = async () => {
      if (attendanceChecks >= 5) return; // Stop after 5 checks

      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL("image/jpeg");

          setLoading(true);
          setMessage("");

          const response = await fetch("http://localhost:8000/log-attendance", {
            method: "POST",
            body: JSON.stringify({ image_data: imageData }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          setAttendanceChecks((prev) => prev + 1);
          if (data.success) {
            setSuccessfulDetections((prev) => prev + 1);
          }

          if (attendanceChecks + 1 < 5) {
            setTimeout(captureFrame, getRandomInterval()); // Schedule next check
          } else {
            finalizeAttendance();
          }
        }
      }
    };

    setTimeout(captureFrame, getRandomInterval()); // Start first capture
  };

  // Function to check if attendance should be logged
  const finalizeAttendance = () => {
    if (successfulDetections >= 4) {
      setMessage("Attendance logged successfully!");
    } else {
      setMessage("Attendance not logged: Insufficient detections.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Live Face Recognition</h1>
      <div className="my-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width="100%"
          height="auto"
          style={{ border: "1px solid black" }}
        />
      </div>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }} />
      <div className="my-4">
        {isStreaming ? <p>System is actively monitoring...</p> : <p>Waiting for camera feed...</p>}
      </div>
      {loading ? <p>Logging attendance...</p> : <p>{message}</p>}
    </div>
  );
}
