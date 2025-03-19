"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import toast from "react-hot-toast";

export default function LiveAttendance() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [recognizedActors, setRecognizedActors] = useState<string[]>([]); // ✅ Initialize as empty array
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleLogAttendance = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedImage || !user) return;

    setUploading(true);
    setMessage("");
    setRecognizedActors([]);

    try {
      const imageBase64 = await convertFileToBase64(selectedImage);

      const response = await fetch("http://localhost:8000/log-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid,
          class_id: "TestClass",
          subject: "TestSubject",
          image_data: imageBase64,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Attendance logged successfully!");
        setRecognizedActors(data.recognized_actors || []); // ✅ Ensure it's always an array
      } else {
        setMessage(data.detail || "Face not recognized!");
      }
    } catch (error) {
      console.error("Error logging attendance:", error);
      setMessage("Error logging attendance.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-black">
      <h1 className="text-2xl font-bold mb-4">Upload Image for Attendance</h1>

      <form onSubmit={handleLogAttendance} className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          disabled={uploading}
        >
          {uploading ? "Logging attendance..." : "Log Attendance"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
      {recognizedActors && recognizedActors.length > 0 && ( // ✅ Safe check
        <div className="mt-2 text-green-600">
          <p>Recognized Actors:</p>
          <ul>
            {recognizedActors.map((actor, index) => (
              <li key={index} className="font-bold">{actor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
