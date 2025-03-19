from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials, firestore, initialize_app
from pydantic import BaseModel
from model_inference import run_inference_on_image
from io import BytesIO
import base64
from datetime import datetime

# 🔹 Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase-sdk.json")
firebase_app = initialize_app(cred)
db = firestore.client()

app = FastAPI()

# 🔹 Allow frontend requests (from Next.js)
# 🔹 Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Temporarily allow all origins (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔹 Attendance Request Model
class AttendanceRequest(BaseModel):
    user_id: str
    subject: str
    class_id: str
    image_data: str  # Base64-encoded image


# 🔹 Verify User Role
def verify_user_role(user_id: str):
    user_doc = db.collection("users").document(user_id).get()
    if not user_doc.exists:
        raise HTTPException(status_code=403, detail="User does not exist")
    return user_doc.to_dict()  # Get user data (role, permissions)


@app.post("/log-attendance")
async def log_attendance(request: AttendanceRequest):
    user_data = verify_user_role(request.user_id)

    # 🔹 Role-based Access Control
    if user_data["role"] == "admin":
        pass  # Admins can mark attendance for any student
    elif (
        user_data["role"] == "coordinator"
        and request.class_id not in user_data.get("managedClasses", [])
    ):
        raise HTTPException(status_code=403, detail="Unauthorized for this class")
    elif (
        user_data["role"] == "teacher"
        and request.subject not in user_data.get("assignedSubjects", [])
    ):
        raise HTTPException(status_code=403, detail="Unauthorized for this subject")

    # 🔹 Decode Base64 Image
    try:
        image_bytes = base64.b64decode(request.image_data.split(",")[1])
        image = BytesIO(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

    # 🔹 Run Face Recognition Model
    result = run_inference_on_image(image)

    if result["success"]:
        now = datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        hour_str = now.strftime("%H:%M")

        recognized_students = result["recognized_actors"]  # List of recognized student names

        for student_name in recognized_students:
            # 🔹 Find student by name
            students_ref = db.collection("students")
            query_ref = students_ref.where("name", "==", student_name).limit(1)
            docs = query_ref.stream()

            student_doc = next(docs, None)
            if not student_doc:
                print(f"Student {student_name} not found in database.")
                continue  # Skip if student not found

            student_data = student_doc.to_dict()
            student_id = student_doc.id
            subjects = student_data.get("subjects", [])

            # 🔹 Find the subject and update attendance
            
            updated_subjects = []
            for subj in subjects:
                if subj["code"] == request.subject:
                    subj["hoursPresent"] = subj.get("hoursPresent", 0) + 1  # Increment hours
                updated_subjects.append(subj)

            # 🔹 Update the student record
            db.collection("students").document(student_id).update(
                {"subjects": updated_subjects}
            )

        return {
            "message": "Attendance logged successfully",
            "recognized_students": recognized_students,
            "date": date_str,
            "hour": hour_str,
            "success": True,
        }
    else:
        return {"message": "Face not recognized", "success": False}
