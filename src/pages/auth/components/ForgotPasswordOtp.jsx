import { useState } from "react";
import { toast } from "react-toastify";
import authStore from "../../../zustand/Store/authStore";

const ForgotPasswordOtp = ({ email, onSuccess }) => {
  const verifyForgotPassOtp = authStore((state) => state.verifyForgotPassOtp);
  const setVerifiedUser = authStore((state) => state.setVerifiedUser);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace
    if (e.key === "Backspace") {
      if (otp[index]) {
        const updated = [...otp];
        updated[index] = "";
        setOtp(updated);
      } else if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }

    // Left Arrow
    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }

    // Right Arrow
    if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Enter
    if (e.key === "Enter") {
      handleOtpVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updated = Array(6).fill("");

    pasted.split("").forEach((digit, i) => {
      updated[i] = digit;
    });

    setOtp(updated);

    const nextIndex = Math.min(pasted.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();
  };

  const handleOtpVerify = async () => {
    try {
      const enteredOtp = otp.join("");

      if (enteredOtp.length < 6) {
        return toast.error("Please enter valid OTP");
      }
      setIsVerifyingOtp(true);
      const payload = {
        email: email,
        otp: enteredOtp,
      };
      await verifyForgotPassOtp(payload);

      setVerifiedUser({
        email,
        otp: enteredOtp,
      });

      toast.success("OTP verified");

      onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifyingOtp(false);
    }
  };
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
          Verify OTP
        </h1>

        <p className="text-white/80 text-sm mt-1">Enter the OTP sent to</p>

        <p className="text-cyan-300 text-sm break-all">{email}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            disabled={isVerifyingOtp}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-12 h-12 rounded-xl
    bg-white/20 border border-white/30
    text-center text-lg font-semibold
    text-white outline-none
    focus:border-cyan-300"
          />
        ))}
      </div>

      <button
        onClick={handleOtpVerify}
        disabled={isVerifyingOtp}
        className={`w-full rounded-2xl py-3 text-white font-semibold shadow-lg transition
    ${
      isVerifyingOtp
        ? "bg-gray-500 cursor-not-allowed opacity-70"
        : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] cursor-pointer"
    }`}
      >
        {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
      </button>
    </>
  );
};

export default ForgotPasswordOtp;
