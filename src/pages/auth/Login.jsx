import { useState } from "react";
import { Eye, EyeOff, User } from "lucide-react";
import bgImage from "../../assets/images/admin-poster.jpg";
import logo from "../../assets/images/logo_nobg.png";
import { useNavigate } from "react-router-dom";
import authStore from "../../zustand/Store/authStore";
import { toast } from "react-toastify";
import loaderStore from "../../zustand/Store/loaderStore";
import { generateFCMToken,  initializeForegroundListener } from '../../Service/firebaseMessagingService';
import { useNotificationStore } from "@/zustand/Store/useNotificationStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const adminLogin = authStore((state) => state.adminLogin);
  const { showLoader, hideLoader } = loaderStore();
  const syncFCMToken = useNotificationStore((state)=>state.syncFCMToken)

  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      if(!email) {
        return toast.error("Please enter a valid email")
      }
      if(!password) {
        return toast.error("Please enter valid password")
      }
      showLoader();
      const loginData = {
        email: email,
        password: password,
      };
      await adminLogin(loginData);
      const fcmToken = await generateFCMToken();
      console.log("34",fcmToken)
      if(fcmToken){
        await syncFCMToken(fcmToken)
      }
      navigate("/dashboard");
    } catch {
      toast.error("Login Failed");
    } finally {
      hideLoader();
    }
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-5 dark:bg-slate-950"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black/10 dark:bg-slate-950/65"></div>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-[32px] border border-white/20 dark:border-slate-700/60 bg-white/10 dark:bg-slate-900/75 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-10 py-10">
          {/* Glow Effect */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-400/30 dark:bg-blue-500/20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-300/20 dark:bg-cyan-400/15 blur-3xl"></div>

          {/* Logo */}
          <div className="relative flex justify-center mb-8">
            <div className="rounded-full bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 shadow-xl">
              <img src={logo} alt="Logo" className="h-20 object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="relative text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-wide">
              Welcome Back
            </h1>
            <p className="text-white dark:text-slate-300 mt-2 text-sm">Sign in to continue</p>
          </div>

          <div className="relative space-y-5">
            {/* email */}
            <div className="relative">
              <input
                type="text"
                placeholder="Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-2xl bg-white/20 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700 py-4 pl-5 pr-12 text-white dark:text-slate-100 placeholder:text-white/60 dark:placeholder:text-slate-400 outline-none backdrop-blur-md focus:border-cyan-300 dark:focus:border-cyan-400 transition-all"
              />

              <User
                size={20}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-800 dark:text-slate-400"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-2xl bg-white/20 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700 py-4 pl-5 pr-12 text-white dark:text-slate-100 placeholder:text-white/60 dark:placeholder:text-slate-400 outline-none backdrop-blur-md focus:border-cyan-300 dark:focus:border-cyan-400 transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 dark:text-slate-400"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-800 dark:text-slate-400 cursor-pointer" />
                ) : (
                  <Eye size={20} className="text-gray-800 dark:text-slate-400 cursor-pointer" />
                )}
              </button>
            </div>
            <div className="flex justify-end items-center gap-3 text-sm">
              <button
                onClick={() => navigate("/verify-mail")}
                className="text-white/80 dark:text-slate-300 cursor-pointer hover:text-cyan-300 dark:hover:text-cyan-400 transition"
              >
                New User? Register
              </button>

              <span className="text-white/40 dark:text-slate-600">|</span>

              <button
                onClick={() => navigate("/forgot-password")}
                className="text-white/80 dark:text-slate-300 cursor-pointer hover:text-cyan-300 dark:hover:text-cyan-400 transition"
              >
                Forgot Password?
              </button>
            </div>
            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400 dark:from-yellow-600 dark:to-amber-500 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/50"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
