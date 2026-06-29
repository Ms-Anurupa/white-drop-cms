import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import authStore from "../../../zustand/Store/authStore";

const ResetPasswordForm = ({ email }) => {
  const resetPassword = authStore((state) => state.resetPassword);
  const verifiedUser = authStore((state) => state.verifiedUser);

  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetPassword = async () => {
    try {
      //   console.log("verifiedUser", verifiedUser);
      //   console.log("registerData", registerData);
      if (!registerData.password.trim()) {
        return toast.error("Password is required");
      }

      if (registerData.password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }

      if (!registerData.confirmPassword.trim()) {
        return toast.error("Please confirm your password");
      }

      if (registerData.password !== registerData.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      setIsResettingPassword(true);

      const payload = {
        email: email,
        password: registerData.password,
        otp: verifiedUser.otp,
      };
      //   console.log("payload", payload);

      const res = await resetPassword(payload);
      toast.success(res?.message || "Password reset successful");
      navigate("/");
    } catch (error) {
      //   console.log("Reset Error:", error);
      //   console.log("Response:", error?.response);
      //   console.log("Data:", error?.response?.data);

      toast.error(error?.response?.data?.message || "Password reset failed");
    } finally {
      setIsResettingPassword(false);
    }
  };
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
          Reset Password
        </h1>

        <p className="text-white/80 text-sm mt-1">Reset password for</p>

        <p className="text-cyan-300 text-sm break-all">{email}</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="New Password"
            value={registerData.password}
            disabled={isResettingPassword}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white/20 border border-white/30
    py-3 pl-5 pr-12 text-white placeholder:text-white/60
    outline-none backdrop-blur-md focus:border-cyan-300
    disabled:opacity-70 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            disabled={isResettingPassword}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70
    disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={registerData.confirmPassword}
            disabled={isResettingPassword}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white/20 border border-white/30
    py-3 pl-5 pr-12 text-white placeholder:text-white/60
    outline-none backdrop-blur-md focus:border-cyan-300
    disabled:opacity-70 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            disabled={isResettingPassword}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70
    disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          onClick={handleResetPassword}
          disabled={isResettingPassword}
          className={`w-full rounded-2xl py-3 text-white font-semibold shadow-lg transition
    ${
      isResettingPassword
        ? "bg-gray-500 cursor-not-allowed opacity-70"
        : "bg-gradient-to-r from-yellow-500 to-yellow-400 hover:scale-[1.02] cursor-pointer"
    }`}
        >
          {isResettingPassword ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </>
  );
};

export default ResetPasswordForm;
