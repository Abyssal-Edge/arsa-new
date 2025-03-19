import { useState, useRef, useEffect } from "react";
import { recognizeFace } from "../../utils/faceRecognition"; // Import the utility function

interface CameraFeedProps {
  userId: string;
  studentId: string;
  classId: string;
  subject: string;
}

export default function CameraFeed({ userId, studentId, classId, subject }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Webcam access denied:", err);
        setError("Error accessing webcam. Please allow camera permissions.");
      }
    };

    startCamera();
  }, []);

  const captureImage = async () => {
    if (!videoRef.current) return;

    setCapturing(true);
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg"); // Convert to Base64

      try {
        // 🔹 Call recognizeFace utility function instead of fetching /api/recognize
        const data = await recognizeFace(userId, studentId, classId, subject, imageData);

        console.log("Recognition Response:", data);

        if (!data.success) {
          throw new Error(data.message || "Recognition failed");
        }

        alert("Face recognized successfully!");
      } catch (err) {
        console.error("Recognition error:", err);
        alert("Face recognition failed. Please try again.");
      } finally {
        setCapturing(false);
      }
    }
  };

  return (
    <div>
      {error ? <p className="text-red-500">{error}</p> : null}
      <video ref={videoRef} autoPlay playsInline className="border rounded" />
      <button
        onClick={captureImage}
        disabled={capturing}
        className="mt-2 px-4 py-2 bg-blue-600 text-white"
      >
        {capturing ? "Processing..." : "Capture"}
      </button>
    </div>
  );
}
