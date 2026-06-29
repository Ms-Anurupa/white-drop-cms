import { useState } from "react";
import logo from "../../assets/images/logo_nobg.png";
import { toast } from "react-toastify";
import bgImage from "../../assets/images/admin-poster.jpg";
import { useNavigate } from "react-router-dom";
import { Mail, User } from "lucide-react";
import authStore from "../../zustand/Store/authStore";

const VerifyMail = () => {
  const navigate = useNavigate();
  const sendOtp = authStore((state) => state.sendOtp);
  const verifyOtp = authStore((state) => state.verifyOtp);
  const setVerifiedUser = authStore((state) => state.setVerifiedUser);

  // const [verificationStep, setVerificationStep] = useState(1);
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [emailData, setEmailData] = useState({
    name: "",
    email: "",
    otp: "",
  });

  const handleChange = (e) => {
    setEmailData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOtpSend = async () => {
    try {
      if (!emailData.name.trim()) {
        return toast.error("Name is required");
      }

      if (!emailData.email.trim()) {
        return toast.error("Email is required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(emailData.email)) {
        return toast.error("Please enter a valid email");
      }

      const payload = {
        name: emailData.name,
        email: emailData.email,
      };

      const res = await sendOtp(payload);

      toast.success(res?.message || "OTP sent successfully");
      setIsOtpRequested(true);
      // setVerificationStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyEmailOtp = async () => {
    try {
      if (!emailData.otp.trim()) {
        return toast.error("Please enter OTP");
      }
      const payload = {
         email: emailData.email,
         otp: emailData.otp,
      }
      const res = await verifyOtp(payload);

      toast.success(res?.message || "Email verified successfully");

      setVerifiedUser({
        name: emailData.name,
        email: emailData.email,
        otp: emailData.otp,
      })

      navigate("/register");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to verify OTP");
    }
  };

  return (
  <section
    className="h-screen overflow-hidden bg-cover bg-center flex items-center justify-center px-4 sm:px-5"
    style={{ backgroundImage: `url(${bgImage})` }}
  >
    <div className="absolute inset-0 bg-black/10"></div>

    <div className="w-full max-w-md z-10">
      <div
        className="relative overflow-hidden rounded-[28px] sm:rounded-[32px]
        border border-white/20 bg-white/10 backdrop-blur-2xl
        shadow-[0_8px_32px_rgba(31,38,135,0.37)]
        px-5 sm:px-8 py-8"
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-20 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div className="bg-white p-2 rounded-full shadow-xl">
            <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
            Verify Email
          </h1>
          <p className="text-white text-sm">
            {isOtpRequested
              ? "Enter OTP sent to your email"
              : "Enter details to receive OTP"}
          </p>
        </div>

        <div className="space-y-4">

          {/* STEP 1: NAME + EMAIL */}
          {!isOtpRequested && (
            <>
              {/* Name */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="First Name"
                  value={emailData.name}
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
                  value={emailData.email}
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

              <button
                onClick={handleOtpSend}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-r
                from-blue-600 to-cyan-500 py-3 text-white
                font-semibold shadow-lg transition hover:scale-[1.02]"
              >
                Send OTP
              </button>
            </>
          )}

          {/* STEP 2: OTP */}
          {isOtpRequested && (
            <>
              {/* Email preview */}
              <div className="text-center text-xs text-white/70">
                OTP sent to: <span className="text-white">{emailData.email}</span>
              </div>

              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={emailData.otp}
                onChange={handleChange}
                className="w-full rounded-2xl bg-white/20 border border-white/30
                py-3 px-5 text-white placeholder:text-white/60
                outline-none backdrop-blur-md focus:border-cyan-300"
              />

              <button
                onClick={handleVerifyEmailOtp}
                className="w-full rounded-2xl bg-gradient-to-r
                from-yellow-500 to-yellow-400 py-3 text-white
                font-semibold cursor-pointer shadow-lg transition hover:scale-[1.02]"
              >
                Verify OTP
              </button>

              <button
                onClick={handleOtpSend}
                className="w-full cursor-pointer text-cyan-300 text-sm hover:underline"
              >
                Resend OTP
              </button>
            </>
          )}

          {/* Back */}
          <p className="text-center text-sm text-white/80">
            Back to{" "}
            <span
              onClick={() => navigate("/")}
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

export default VerifyMail;
