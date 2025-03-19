import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Settings, Users, FileText, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`h-screen bg-black text-white p-4 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}>
        {/* Sidebar Header with Toggle Button */}
        <div className="flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">ASRA</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="mt-6 space-y-2">
          <Link href="/dashboard" className="flex items-center p-2 hover:bg-gray-800 rounded">
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="ml-2">Dashboard</span>}
          </Link>

          {/* Settings Section */}
          <div>
            <button onClick={() => toggleSection("settings")} className="flex items-center w-full p-2 hover:bg-gray-800 rounded">
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span className="ml-2">Settings</span>}
            </button>
            <AnimatePresence>
              {openSections.settings && sidebarOpen && (
                <motion.div className="pl-6 mt-2 space-y-1">
                  <Link href="/users" className="block text-sm hover:underline">Users</Link>
                  <Link href="/account" className="block text-sm hover:underline">Account</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
