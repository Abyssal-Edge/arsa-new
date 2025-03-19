export async function recognizeFace(
  userId: string,
  studentId: string,
  classId: string,
  subject: string,
  imageData: string
) {
  try {
    const response = await fetch("http://127.0.0.1:8000/log-attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        student_id: studentId,
        class_id: classId,
        subject: subject,
        image_data: imageData,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error recognizing face:", error);
    return { success: false, message: "Recognition failed." };
  }
}
