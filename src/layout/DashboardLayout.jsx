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
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar onLogOut={handleLogout} onNavClick={close}/>

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <Header onLogOut={handleLogout}/>

        {/* Page Content */}
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
