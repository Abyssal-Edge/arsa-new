import firebase_admin
from firebase_admin import credentials, firestore

# 🔹 Initialize Firebase Admin SDK
cred = credentials.Certificate("arsa-761d0-firebase-adminsdk-fbsvc-3ef22bfeab.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 🔹 Timetable Data for S8 CS-1
timetable_data = {
    "class": "S8 CS-1",
    "timetable": {
        "Monday": [
            {"hour": 1, "subject": "PE III", "options": [
                {"code": "CS1U42D", "name": "Soft Computing", "teacher": "Ms. Gayathri K S"},
                {"code": "CS1U42C", "name": "Cryptography", "teacher": "Ms. Vijitha Robinson"}
            ]},
            {"hour": 2, "subject": "DC", "code": "CS1U40B", "teacher": "Ms. Prathibha S Nair"},
            {"hour": 3, "subject": "PE V", "options": [
                {"code": "CS1U44B", "name": "Blockchain Technologies", "teacher": "Mr. Anand Haridas"},
                {"code": "CS1U44E", "name": "Software Testing", "teacher": "Mr. Shon J Das"}
            ]},
            {"hour": 4, "subject": "PE III", "options": [
                {"code": "CS1U42D", "name": "Soft Computing", "teacher": "Ms. Gayathri K S"},
                {"code": "CS1U42C", "name": "Cryptography", "teacher": "Ms. Vijitha Robinson"}
            ]},
            {"hour": 5, "subject": "PE IV", "code": "CS1U43F", "teacher": "Dr. Neena Raj"},
            {"hour": 6, "subject": "DC", "code": "CS1U40B", "teacher": "Ms. Prathibha S Nair"}
        ],
        "Tuesday": [
            {"hour": 1, "subject": "PE V", "options": [
                {"code": "CS1U44B", "name": "Blockchain Technologies", "teacher": "Mr. Anand Haridas"},
                {"code": "CS1U44E", "name": "Software Testing", "teacher": "Mr. Shon J Das"}
            ]},
            {"hour": 2, "subject": "DC", "code": "CS1U40B", "teacher": "Ms. Prathibha S Nair"},
            {"hour": 3, "subject": "PE V", "options": [
                {"code": "CS1U44B", "name": "Blockchain Technologies", "teacher": "Mr. Anand Haridas"},
                {"code": "CS1U44E", "name": "Software Testing", "teacher": "Mr. Shon J Das"}
            ]},
            {"hour": 4, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 5, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 6, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"}
        ],
        "Wednesday": [
            {"hour": 1, "subject": "PE IV", "code": "CS1U43F", "teacher": "Dr. Neena Raj"},
            {"hour": 2, "subject": "DC", "code": "CS1U40B", "teacher": "Ms. Prathibha S Nair"},
            {"hour": 3, "subject": "PE IV", "code": "CS1U43F", "teacher": "Dr. Neena Raj"},
            {"hour": 4, "subject": "PE III", "options": [
                {"code": "CS1U42D", "name": "Soft Computing", "teacher": "Ms. Gayathri K S"},
                {"code": "CS1U42C", "name": "Cryptography", "teacher": "Ms. Vijitha Robinson"}
            ]},
            {"hour": 5, "subject": "CCV", "code": "CS1U40C", "teacher": "Dr. Neena Raj"},
            {"hour": 6, "subject": "CCV", "code": "CS1U40C", "teacher": "Dr. Neena Raj"}
        ],
        "Thursday": [
            {"hour": 1, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 2, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 3, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 4, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 5, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 6, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"}
        ],
        "Friday": [
            {"hour": 1, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 2, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 3, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 4, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 5, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"},
            {"hour": 6, "subject": "Project", "code": "CS1U49C", "teacher": "Dr. Jesna Mohan"}
        ]
    }
}

# 🔹 Upload timetable to Firestore
def upload_timetable():
    try:
        db.collection("timetables").document("S8 CS-1").set(timetable_data)
        print("✅ Timetable for S8 CS-1 uploaded successfully!")
    except Exception as e:
        print("❌ Error uploading timetable:", e)

# 🔹 Run the function
if __name__ == "__main__":
    upload_timetable()
