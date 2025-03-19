"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import Dashnav from "../../components/DashNav";
import { Check } from "lucide-react";

export default function Students() {
  interface AttendanceEntry {
    hour: number;
    name: string;
    hoursPresent: number;
  }

  interface Student {
    id: string;
    name: string;
    studentId: string;
    class: string;
    electives?: { [code: string]: string };
    attendance: {
      [date: string]: {
        [subjectCode: string]: AttendanceEntry[];
      };
    };
  }

  interface TimetableEntry {
    hour: number;
    subject: string;
    code?: string;
    teacher?: string;
    options?: { code: string; name: string; teacher: string }[];
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  // 🔹 Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const studentsRef = collection(db, "students");
        const snapshot = await getDocs(studentsRef);
        const uniqueClasses = new Set<string>();

        snapshot.docs.forEach((doc) => {
          const studentData = doc.data();
          if (studentData.class) uniqueClasses.add(studentData.class);
        });

        setClasses(Array.from(uniqueClasses));
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  // 🔹 Fetch Students when class changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;

      try {
        const studentsQuery = query(
          collection(db, "students"),
          where("class", "==", selectedClass)
        );
        const querySnapshot = await getDocs(studentsQuery);

        const studentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];

        setStudents(studentList);
        console.log("Fetched students:", studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Error fetching students");
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // 🔹 Fetch Timetable when class & date change
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedClass || !selectedDate) return;

      const dayOfWeek = new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long",
      });

      try {
        const timetableRef = doc(db, "timetables", selectedClass);
        const timetableSnap = await getDoc(timetableRef);

        if (timetableSnap.exists()) {
          const data = timetableSnap.data();
          setTimetable(data.timetable[dayOfWeek] || []);
        } else {
          setTimetable([]);
          toast.error("Timetable not found for this class.");
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
        toast.error("Error fetching timetable");
      }
    };

    fetchTimetable();
  }, [selectedClass, selectedDate]);

  // ✅ **Mark Attendance for a Specific Hour**
  const markAttendance = async (
    studentId: string,
    subjectCode: string | undefined,
    hour: number
  ) => {
    if (!selectedDate) {
      toast.error("Please select a date first!");
      return;
    }

    if (!subjectCode) {
      toast.error("Invalid subject selected.");
      return;
    }

    try {
      const studentRef = doc(db, "students", studentId);
      const studentSnap = await getDoc(studentRef);
      if (!studentSnap.exists()) return;

      let studentData = studentSnap.data();
      let updatedAttendance = studentData.attendance
        ? { ...studentData.attendance }
        : {};

      // Ensure date exists in attendance object
      if (!updatedAttendance[selectedDate]) {
        updatedAttendance[selectedDate] = {};
      }

      // Ensure subject entry exists in attendance
      if (!updatedAttendance[selectedDate][subjectCode]) {
        updatedAttendance[selectedDate][subjectCode] = [];
      }

      // ✅ Prevent multiple marking for the same hour
      const hourEntry = updatedAttendance[selectedDate][subjectCode].find(
        (entry: AttendanceEntry) => entry.hour === hour
      );

      if (hourEntry) {
        toast.error("Attendance already marked for this hour.");
        return;
      }

      // ✅ Add new attendance entry safely
      updatedAttendance[selectedDate][subjectCode].push({
        name: subjectCode, // Ensure this is always a string
        hour,
        hoursPresent: 1,
      });

      await updateDoc(studentRef, { attendance: updatedAttendance });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, attendance: updatedAttendance }
            : student
        )
      );

      toast.success("Attendance marked!");
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Error updating attendance");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <Dashnav />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Student Attendance</h1>

        {/* 🔹 Class & Date Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Class:
            </label>
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

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Date:
            </label>
            <input
              type="date"
              className="border rounded px-3 py-1 text-gray-700 shadow-sm w-full"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* 🔹 Attendance Table */}
        <table className="w-full border-collapse border border-gray-300 bg-white shadow rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Student ID</th>
              <th className="border px-4 py-2">Name</th>
              {timetable.map(({ hour, code }) => (
                <th key={hour} className="border px-4 py-2">
                  Hour {hour} ({code || "Elective"})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="border px-4 py-2">{student.studentId}</td>
                <td className="border px-4 py-2">{student.name}</td>
                {timetable.map(({ hour, code, options }) => (
                  <td
                    key={`${hour}-${code ?? "elective"}`}
                    className="border px-4 py-2 text-center"
                  >
                    {options && student.electives ? (
                      // ✅ Elective subjects: Display only the student's chosen electives
                      options
                        .filter((opt) => student.electives?.[opt.code]) // Ensure the student has this elective
                        .map((opt) => {
                          // ✅ Check if attendance is already marked
                          const isMarked = student.attendance?.[selectedDate]?.[
                            opt.code
                          ]?.some((entry) => entry.hour === hour);

                          return (
                            <div key={opt.code} className="mb-2">
                              {isMarked ? (
                                <p className="text-green-600 font-semibold">
                                  Present
                                </p>
                              ) : (
                                <button
                                  onClick={() =>
                                    markAttendance(student.id, opt.code, hour)
                                  }
                                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                >
                                  {opt.name}
                                </button>
                              )}
                            </div>
                          );
                        })
                    ) : code ? (
                      // ✅ Regular subjects: Show "Mark" if student is enrolled
                      student.attendance?.[selectedDate]?.[code]?.some(
                        (entry) => entry.hour === hour
                      ) ? (
                        <p className="text-green-600 font-semibold">Present</p>
                      ) : (
                        <button
                          onClick={() => markAttendance(student.id, code, hour)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        >
                          Mark
                        </button>
                      )
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
