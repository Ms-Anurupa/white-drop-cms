import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";
import authStore from "../../../zustand/Store/authStore";

const ForgotPasswordEmail = ({ email, setEmail, onSuccess }) => {
  const sendForgotPassOtp = authStore((state) => state.sendForgotPassOtp);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleEmailSubmit = async () => {
    try {
      if (!email.trim()) {
        return toast.error("Email is required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return toast.error("Please enter a valid email");
      }

      setIsSendingOtp(true);

      await sendForgotPassOtp({ email });

      toast.success("OTP sent successfully");

      onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
          Forgot Password
        </h1>

        <p className="text-white/80 dark:text-slate-300 text-sm mt-1">
          Enter your email to receive OTP
        </p>
      </div>

      <div className="relative mb-5">
        <input
          disabled={isSendingOtp}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl bg-white/20 dark:bg-slate-800/80
          border border-white/30 dark:border-slate-700 py-3 pl-5 pr-12
          text-white dark:text-slate-100 placeholder:text-white/60 dark:placeholder:text-slate-400
          outline-none backdrop-blur-md
          focus:border-cyan-300 dark:focus:border-cyan-400 dark:disabled:bg-slate-800/50"
        />

        <Mail
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 dark:text-slate-400"
          size={18}
        />
      </div>

      <button
        onClick={handleEmailSubmit}
        disabled={isSendingOtp}
        className={`w-full rounded-2xl py-3 text-white font-semibold shadow-lg transition
    ${
      isSendingOtp
        ? "bg-gray-500 dark:bg-slate-700 cursor-not-allowed opacity-70"
        : "bg-gradient-to-r from-yellow-500 to-yellow-400 dark:from-yellow-600 dark:to-amber-500 hover:scale-[1.02] cursor-pointer"
    }`}
      >
        {isSendingOtp ? "Sending..." : "Send OTP"}
      </button>
    </>
  );
};

export default ForgotPasswordEmail;
