"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import Dashnav from "../components/DashNav";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [managedClasses, setManagedClasses] = useState<string[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      setUser(currentUser);
      await fetchUserRole(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

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

  const fetchStudents = async (userRole: string) => {
    if (!selectedClass) return;
  
    try {
      const studentsQuery = query(collection(db, "students"), where("class", "==", selectedClass));
      const querySnapshot = await getDocs(studentsQuery);
  
      let studentList = querySnapshot.docs.map((doc) => {
        const studentData = doc.data();
        const totalAttendance = calculateTotalAttendance(studentData.attendance || {});
  
        return {
          id: doc.id,
          studentId: studentData.studentId, // Ensure Roll Number is included
          name: studentData.name, // Ensure Name is included
          class: studentData.class, // Ensure Class is included
          subject: studentData.subject, // Ensure Subject is included (if needed)
          totalAttendance,
        };
      });
  
      if (userRole === "coordinator") {
        studentList = studentList.filter((student) => managedClasses.includes(student.class));
      } else if (userRole === "teacher") {
        studentList = studentList.filter((student) => assignedSubjects.includes(student.subject));
      }
  
      setStudents(studentList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
      setLoading(false);
    }
  };
  

  const fetchUserRole = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setRole(userData.role);
        setManagedClasses(userData.managedClasses || []);
        setAssignedSubjects(userData.assignedSubjects || []);

        await fetchClasses();
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      toast.error("Failed to fetch user role");
    }
  };

  const calculateTotalAttendance = (attendanceData: any) => {
    const totalAttendance: Record<string, number> = {};
  
    Object.values(attendanceData).forEach((day: any) => {
      Object.entries(day).forEach(([subjectCode, records]: any) => {
        if (!totalAttendance[subjectCode]) {
          totalAttendance[subjectCode] = 0;
        }
  
        // ✅ Sum all 'hoursPresent' from attendance records
        totalAttendance[subjectCode] += records.reduce(
          (sum: number, entry: any) => sum + (entry.hoursPresent || 0),
          0
        );
      });
    });
  
    return totalAttendance;
  };
  

  useEffect(() => {
    if (selectedClass && role) fetchStudents(role);
  }, [selectedClass, role]);

  return user ? (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      <Dashnav />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Attendance Overview</h1>
        </div>

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

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700">Roll Number</th>
                  <th className="px-4 py-3 text-left text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700">Total Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map(({ id, studentId, name, totalAttendance }) => (
                    <tr key={id} className="border-t">
                      <td className="px-4 py-3">{studentId}</td>
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3">
                        {Object.entries(totalAttendance).length > 0 ? (
                          Object.entries(totalAttendance).map(([subjectCode, hours]: any) => (
                            <div key={subjectCode} className="text-green-600">
                              {subjectCode}: <span className="font-semibold text-blue-600">{hours} hours</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">No attendance recorded</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                      Select a class to view attendance.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  ) : null;
}
