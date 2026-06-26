import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import authStore from "../zustand/Store/authStore";
import { toast } from "react-toastify";

const DashboardLayout = () => {

  const logOut = authStore((state) => state.logOut)

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
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar onLogOut={handleLogout} onNavClick={close}/>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header onLogOut={handleLogout}/>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
