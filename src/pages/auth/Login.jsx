import { useState } from "react";
import { Eye, EyeOff, User } from "lucide-react";
import bgImage from "../../assets/images/admin-poster.jpg";
import logo from "../../assets/images/logo_nobg.png";
import { useNavigate } from "react-router-dom";
import authStore from "../../zustand/Store/authStore";
import { toast } from "react-toastify";
import loaderStore from "../../zustand/Store/loaderStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const adminLogin = authStore((state) => state.adminLogin);
  const { showLoader, hideLoader } = loaderStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      showLoader()
      const loginData = {
        email: email,
        password: password,
      }
      const res = await adminLogin(loginData);
      console.log("res", res.data);
      console.log({ email, password });
      navigate("/dashboard");
    } catch {
      toast.error("Login Failed")
    } finally {
      hideLoader()
    }
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-5"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] px-10 py-10">
          {/* Glow Effect */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl"></div>

          {/* Logo */}
          <div className="relative flex justify-center mb-8">
            <div className="rounded-full bg-white p-4 shadow-xl">
              <img src={logo} alt="Logo" className="h-20 object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="relative text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 tracking-wide">
              Welcome Back
            </h1>
            <p className="text-white mt-2 text-sm">Sign in to continue</p>
          </div>

          <div className="relative space-y-5">
            {/* email */}
            <div className="relative">
              <input
                type="text"
                placeholder="Email Id / Phone No."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-2xl bg-white/20 border border-white/30 py-4 pl-5 pr-12 text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-cyan-300 transition-all"
              />

              <User
                size={20}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-800"
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
                className="w-full rounded-2xl bg-white/20 border border-white/30 py-4 pl-5 pr-12 text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-cyan-300 transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-800 cursor-pointer" />
                ) : (
                  <Eye size={20} className="text-gray-800 cursor-pointer" />
                )}
              </button>
            </div>
            <div className="flex justify-end items-center gap-3 text-sm">
              <button
               onClick={() => navigate('/register')}
               className="text-white/80 cursor-pointer hover:text-cyan-300 transition">
                New User? Register
              </button>

              <span className="text-white/40">|</span>

              <button 
               onClick={() => navigate('/forgot-password')}
              className="text-white/80 cursor-pointer hover:text-cyan-300 transition">
                Forgot Password?
              </button>
            </div>
            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/50"
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
