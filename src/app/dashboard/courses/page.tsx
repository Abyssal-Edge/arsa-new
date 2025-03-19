"use client";

import Dashnav from "../../components/DashNav";

export default function CoursesPage() {
  // 🔹 Hardcoded courses
  const courses = [
    { code: "CS1U40B", name: "Distributed Computing", hoursAttended: 1 },
    { code: "CS1U42C", name: "Cryptography", hoursAttended: 1 },
    { code: "CS1U43F", name: "Data Mining", hoursAttended: 0 },
    { code: "CS1U44B", name: "Blockchain Technologies", hoursAttended: 0 },
    { code: "CS1U49C", name: "Project Phase II", hoursAttended: 0 }
  ];

  return (
    <div className="flex h-screen">
      <Dashnav />
      <div className="flex-1 p-8 bg-gray-100 text-black">
        <h1 className="text-3xl font-bold mb-4 text-black">Courses</h1>
        <div className="bg-white shadow-lg rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700">Course Code</th>
                <th className="px-4 py-3 text-left text-gray-700">Course Name</th>
                <th className="px-4 py-3 text-left text-gray-700">Hours Attended</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(({ code, name, hoursAttended }) => (
                <tr key={code} className="border-t">
                  <td className="px-4 py-3">{code}</td>
                  <td className="px-4 py-3">{name}</td>
                  <td className="px-4 py-3">{hoursAttended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
