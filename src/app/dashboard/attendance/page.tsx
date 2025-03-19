"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import Dashnav from "../../components/DashNav";

// ✅ Define Student Attendance Structure
interface AttendanceRecord {
  name: string;
  hoursPresent: number;
}

interface Student {
  id: string;
  name: string;
  class: string;
  attendance: Record<string, Record<string, AttendanceRecord | AttendanceRecord[]>>; // Handle both object & array cases
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState(""); // 🔹 Selected class
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [classes, setClasses] = useState<string[]>([]); // 🔹 List of unique classes

  // 🔹 Fetch all unique classes from Firestore
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const studentsRef = collection(db, "students");
        const snapshot = await getDocs(studentsRef);

        const uniqueClasses = new Set<string>();
        snapshot.docs.forEach((doc) => {
          const studentData = doc.data() as Student;
          if (studentData.class) uniqueClasses.add(studentData.class);
        });

        setClasses(Array.from(uniqueClasses));
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  // 🔹 Fetch students for the selected class
  useEffect(() => {
    if (!selectedClass) return; // Do nothing if no class is selected

    const fetchAttendance = async () => {
      try {
        const studentsRef = query(collection(db, "students"), where("class", "==", selectedClass));
        const snapshot = await getDocs(studentsRef);

        const studentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];

        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [selectedClass]);

  return (
    <div className="flex h-screen">
      <Dashnav />
      <div className="flex-1 p-8 bg-gray-100 text-black">
        <h1 className="text-3xl font-bold text-black mb-4">Student Attendance</h1>

        {/* 🔹 Class Selector */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Date Picker */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>

        {/* 🔹 Attendance Table */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-gray-700">Subjects & Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => {
                  const attendanceForDate = student.attendance?.[selectedDate] || {};
                  const subjects = Object.entries(attendanceForDate)
                    .map(([subjectCode, entry]) => {
                      if (Array.isArray(entry)) {
                        // If entry is an array, return all hours
                        return entry.map((record) => ({
                          code: subjectCode,
                          name: record.name,
                          hoursPresent: record.hoursPresent,
                        }));
                      } else if (typeof entry === "object") {
                        // If entry is an object, return single entry
                        return [
                          {
                            code: subjectCode,
                            name: entry.name,
                            hoursPresent: entry.hoursPresent,
                          },
                        ];
                      } else {
                        return []; // Handle unexpected cases
                      }
                    })
                    .flat();

                  return (
                    <tr key={student.id} className="border-t">
                      <td className="px-4 py-3 font-semibold">{student.name}</td>
                      <td className="px-4 py-3">
                        {subjects.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {subjects.map(({ code, name, hoursPresent }) => (
                              <li key={code}>
                                {name}:{" "}
                                <span className="font-semibold text-blue-600">
                                  {hoursPresent} hours
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No records for this date.</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-gray-500">
                    {selectedClass ? "No students found for this class." : "Select a class to view attendance."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🔹 Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
