import { useState } from "react";
import { Eye, EyeOff, User, Mail, Phone } from "lucide-react";
import bgImage from "../../assets/images/admin-poster.jpg";
import logo from "../../assets/images/White Drop Logo-01.jpg";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = () => {
    console.log(form);
    navigate("/dashboard");
  };

  return (
    <section
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-5 py-10"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.37)] px-8 py-10">

          {/* Glow */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl"></div>

          {/* Logo */}
          <div className="relative flex justify-center mb-6">
            <div className="rounded-full bg-white p-4 shadow-xl">
              <img src={logo} alt="Logo" className="h-16 object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Create Account</h1>
            <p className="text-white/80 text-sm">Sign up to get started</p>
          </div>

          <div className="space-y-4">

            {/* Name */}
            <div className="relative">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30 py-3 pl-5 pr-12 text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70" size={18} />
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30 py-3 pl-5 pr-12 text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70" size={18} />
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30 py-3 pl-5 pr-12 text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70" size={18} />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30 py-3 pl-5 pr-12 text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30 py-3 pl-5 pr-12 text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Button */}
            <button
              onClick={register}
              className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400 py-3 text-white font-semibold shadow-lg transition hover:scale-[1.02]"
            >
              Create Account
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-white/80">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-cyan-300 cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;