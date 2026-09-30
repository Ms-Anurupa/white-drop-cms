import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import authStore from "../zustand/Store/authStore";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { initializeForegroundListener } from "@/Service/firebaseMessagingService";

const DashboardLayout = () => {
  const logOut = authStore((state) => state.logOut);
  useEffect(() => {
    // 1. Start the listener when the dashboard mounts
    const unsubscribe = initializeForegroundListener();

    // 2. Clean up the listener when the component unmounts (e.g. logout)
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch {
      toast.error("LogOut Failed");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar onLogOut={handleLogout} onNavClick={close} />

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <Header onLogOut={handleLogout} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
