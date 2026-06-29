import { useState } from "react";
import { Eye, EyeOff, User, Mail, Phone } from "lucide-react";
import bgImage from "../../assets/images/admin-poster.jpg";
import logo from "../../assets/images/logo_nobg.png";
import { useNavigate } from "react-router-dom";
import authStore from "../../zustand/Store/authStore";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const adminRegister = authStore((state) => state.adminRegister);
  const verifiedUser = authStore((state) => state.verifiedUser);
  const clearVerificationUser = authStore((state) => state.clearVerificationUser);


  const [registerData, setRegisterData] = useState({
    first_name: verifiedUser?.name || "",
    last_name: "",
    email: verifiedUser?.email || "",
    otp: verifiedUser?.otp,
    password: "",
    phone_number: "",
    privilege: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      //validations 
        if (!registerData.first_name.trim()) {
      return toast.error("First name is required");
    }
 
    if (!registerData.last_name.trim()) {
      return toast.error("Last name is required");
    }

    if (!registerData.email.trim()) {
      return toast.error("Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(registerData.email)) {
      return toast.error("Please enter a valid email");
    }

    if (!registerData.phone_number.trim()) {
      return toast.error("Phone number is required");
    }

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(registerData.phone_number)) {
      return toast.error("Please enter a valid 10-digit phone number");
    }

    if (!registerData.password) {
      return toast.error("Password is required");
    }

    if (registerData.password.length < 6) {
      return toast.error(
        "Password must be at least 6 characters"
      );
    }

    if (!registerData.confirmPassword) {
      return toast.error("Please confirm your password");
    }

    if (registerData.password !== registerData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

      const payload = {
        ...registerData,
      }
      const res = await adminRegister(payload);
      console.log(res.data);
      clearVerificationUser();
      toast.success("Registration Successfull");
      navigate("/");
    } catch {
      toast.error("Registration Failed");
    }
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
            <p className="text-white text-xs sm:text-sm">
              Sign up to get started
            </p>
          </div>

          {/* Form */}
          <div className="space-y-2 sm:space-y-2">
            {/*first Name */}
            <div className="relative">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={registerData.first_name}
                disabled={!!verifiedUser}
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

            {/*last Name */}
            <div className="relative">
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={registerData.last_name}
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
                value={registerData.email}
                disabled={!!verifiedUser}
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
                name="phone_number"
                placeholder="Phone Number"
                value={registerData.phone_number}
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
                value={registerData.password}
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
                value={registerData.confirmPassword}
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

            <div className="relative">
              <select
                name="privilege"
                value={registerData.privilege}
                onChange={handleChange}
                className="w-full cursor-pointer rounded-2xl bg-white/20 border border-white/30
    py-3 px-5 text-white outline-none backdrop-blur-md
    focus:border-cyan-300"
              >
                <option value="" className="text-black">
                  Select Role
                </option>
                <option value="ADMIN" className="text-black">
                  ADMIN
                </option>
                <option value="SUPER USER" className="text-black">
                  SUPER_USER
                </option>
              </select>
            </div>

            {/* Button */}
            <button
              onClick={handleRegister}
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
