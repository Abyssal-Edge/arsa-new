"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, BookOpen, BarChart, LogOut } from "lucide-react";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

const Dashnav = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // Use Next.js navigation instead of window.location.href
  };

  return (
    <div className="w-64 min-h-screen bg-[#181818] text-white shadow-lg flex flex-col p-4">
      {/* Dashboard Title */}
      <h1 className="text-xl font-bold text-gray-200 mb-6">Teacher Dashboard</h1>

      {/* Navigation Links */}
      <nav className="space-y-2">
        {[
          { name: "Dashboard", href: "/dashboard", icon: Home },
          { name: "Students", href: "/dashboard/students", icon: Users },
          { name: "Attendance", href: "/dashboard/attendance", icon: BookOpen },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center p-3 rounded-md transition-colors ${
              pathname === item.href
                ? "bg-[#4F46E5] text-white"
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 text-red-500 hover:bg-red-600 hover:text-white rounded-md mt-4 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </nav>
    </div>
  );
};

export default Dashnav;
