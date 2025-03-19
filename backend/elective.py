import firebase_admin
from firebase_admin import credentials, firestore

# 🔹 Initialize Firebase Admin with Service Account
cred = credentials.Certificate("arsa-761d0-firebase-adminsdk-fbsvc-3ef22bfeab.json")  # Update with actual path
firebase_admin.initialize_app(cred)

db = firestore.client()

# 🔹 Define elective subject mappings
elective_mappings = {
    "S8 CS-1": {
        "PE III": { "B21CS1116": "CS1U42C" },  # Ashwathy -> Soft Computing
        "PE V": { "B21CS1116": "CS1U44B" }    # Ashwathy -> Blockchain Technologies
    },
    # Add more class mappings as needed
}

# 🔹 Function to migrate electives for students
def migrate_electives():
    try:
        students_ref = db.collection("students")
        students = students_ref.stream()

        for student_doc in students:
            student_data = student_doc.to_dict()
            student_id = student_data.get("studentId")
            student_class = student_data.get("class")

            if student_class not in elective_mappings:
                continue  # Skip students without predefined electives

            electives = {}

            # Assign electives based on the mapping
            for subject, student_mapping in elective_mappings[student_class].items():
                elective_code = student_mapping.get(student_id)
                if elective_code:
                    electives[elective_code] = subject  # Store as { "CS1U42D": "Soft Computing" }

            # Update Firestore document
            if electives:
                student_doc.reference.update({"electives": electives})
                print(f"✅ Updated {student_data.get('name')} ({student_id}) with electives:", electives)

        print("🎉 Electives migration completed successfully!")

    except Exception as e:
        print("❌ Error migrating electives:", str(e))

# 🔹 Run Migration
migrate_electives()
