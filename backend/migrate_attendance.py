import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin.firestore import DELETE_FIELD
from datetime import datetime

# Initialize Firebase Admin SDK
cred = credentials.Certificate("arsa-761d0-firebase-adminsdk-fbsvc-3ef22bfeab.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def migrate_students():
    students_ref = db.collection("students")
    students = students_ref.stream()

    for student in students:
        student_data = student.to_dict()
        subjects = student_data.get("subjects", [])

        # Create an attendance dictionary with today's date
        attendance = {}
        today = datetime.today().strftime('%Y-%m-%d')  # Format: YYYY-MM-DD

        for subject in subjects:
            subject_code = subject.get("code", None)  # ✅ Ensure key exists
            
            if not subject_code:  # ✅ Skip subjects without a valid code
                print(f"⚠️ Skipping subject with missing code for {student_data['name']}: {subject}")
                continue
            
            if today not in attendance:
                attendance[today] = {}

            attendance[today][subject_code] = {
                "name": subject["name"],
                "hoursPresent": subject.get("hoursPresent", 0)  # Default to 0 if missing
            }
        
        # Update Firestore document
        students_ref.document(student.id).update({
            "attendance": attendance,
            "subjects": DELETE_FIELD  # ✅ Remove old subjects array
        })
        print(f"✅ Updated attendance for {student_data['name']}")

if __name__ == "__main__":
    migrate_students()
    print("✅ Migration complete!")
