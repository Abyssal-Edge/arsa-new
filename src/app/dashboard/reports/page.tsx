"use client";

import { useEffect, useState } from "react";
import Dashnav from "../../components/DashNav";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";

Chart.register(...registerables);

interface AttendanceReport {
  className: string;
  subject: string;
  totalStudents: number;
  presentCount: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceReports();
  }, []);

  const fetchAttendanceReports = async () => {
    try {
      const studentsRef = collection(db, "students");
      const snapshot = await getDocs(studentsRef);

      const attendanceMap: Record<string, Record<string, { total: number; present: number }>> = {};

      snapshot.docs.forEach((doc) => {
        const studentData = doc.data();
        if (!studentData.class || !studentData.attendance) return;

        Object.entries(studentData.attendance).forEach(([date, subjects]: any) => {
          Object.entries(subjects).forEach(([subjectCode, records]: any) => {
            const key = `${studentData.class}_${subjectCode}`;

            if (!attendanceMap[studentData.class]) {
              attendanceMap[studentData.class] = {};
            }
            if (!attendanceMap[studentData.class][subjectCode]) {
              attendanceMap[studentData.class][subjectCode] = { total: 0, present: 0 };
            }

            attendanceMap[studentData.class][subjectCode].total += 1;
            attendanceMap[studentData.class][subjectCode].present += records.length;
          });
        });
      });

      const formattedReports: AttendanceReport[] = [];
      Object.entries(attendanceMap).forEach(([className, subjects]) => {
        Object.entries(subjects).forEach(([subject, data]) => {
          formattedReports.push({
            className,
            subject,
            totalStudents: data.total,
            presentCount: data.present,
          });
        });
      });

      setReports(formattedReports);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance reports:", error);
      toast.error("Failed to load attendance reports.");
      setLoading(false);
    }
  };

  const chartData = {
    labels: reports.map((report) => `${report.className} - ${report.subject}`),
    datasets: [
      {
        label: "Attendance %",
        data: reports.map((report) =>
          report.totalStudents > 0
            ? ((report.presentCount / report.totalStudents) * 100).toFixed(2)
            : 0
        ),
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336", "#2196F3", "#9C27B0"],
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Dashnav />
      <div className="flex-1 p-8 text-black">
        <h1 className="text-3xl font-bold mb-4">Attendance Reports</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-500">No attendance records found.</p>
        ) : (
          <>
            <div className="bg-white shadow-lg rounded-lg p-6">
              <Bar data={chartData} />
            </div>

            <div className="mt-6 bg-white shadow-lg rounded-lg p-4">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Class</th>
                    <th className="px-4 py-3 text-left text-gray-700">Subject</th>
                    <th className="px-4 py-3 text-left text-gray-700">Total Students</th>
                    <th className="px-4 py-3 text-left text-gray-700">Present</th>
                    <th className="px-4 py-3 text-left text-gray-700">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(({ className, subject, totalStudents, presentCount }) => (
                    <tr key={`${className}-${subject}`} className="border-t">
                      <td className="px-4 py-3">{className}</td>
                      <td className="px-4 py-3">{subject}</td>
                      <td className="px-4 py-3">{totalStudents}</td>
                      <td className="px-4 py-3">{presentCount}</td>
                      <td className="px-4 py-3">
                        {totalStudents > 0
                          ? ((presentCount / totalStudents) * 100).toFixed(2) + "%"
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
