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
      className="h-screen overflow-hidden bg-cover bg-center flex items-center justify-center px-4 sm:px-5"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="w-full max-w-md z-10">
        <div
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px]
  border border-white/20 bg-white/10 backdrop-blur-2xl
  shadow-[0_8px_32px_rgba(31,38,135,0.37)]
  px-5 sm:px-8"
        >
          {/* Glow */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-20 w-40 rounded-full bg-cyan-300/20 blur-3xl"></div>

          {/* Logo */}
          <div className="flex justify-center p-4">
            <div className="bg-white p-2 rounded-full shadow-xl">
              <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2 sm:mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
              Create Account
            </h1>
            <p className="text-white/80 text-xs sm:text-sm">
              Sign up to get started
            </p>
          </div>

          {/* Form */}
          <div className="space-y-2 sm:space-y-2">
            {/* Name */}
            <div className="relative">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30
                py-3 pl-5 pr-12 text-white placeholder:text-white/60
                outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <User
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
                size={18}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30
                py-3 pl-5 pr-12 text-white placeholder:text-white/60
                outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <Mail
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
                size={18}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30
                py-2 pl-5 pr-12 text-white placeholder:text-white/60
                outline-none backdrop-blur-md focus:border-cyan-300"
              />
              <Phone
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
                size={18}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30
                py-3 pl-5 pr-12 text-white placeholder:text-white/60
                outline-none backdrop-blur-md focus:border-cyan-300"
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
                className="w-full rounded-2xl bg-white/20 border border-white/30
                py-3 pl-5 pr-12 text-white placeholder:text-white/60
                outline-none backdrop-blur-md focus:border-cyan-300"
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
              className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400
              py-3 text-white cursor-pointer font-semibold shadow-lg transition hover:scale-[1.02]"
            >
              Create Account
            </button>

            {/* Login link */}
            <p className="mb-4 text-center text-xs sm:text-sm text-white/80">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-cyan-300 cursor-pointer hover:underline mb-4"
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
