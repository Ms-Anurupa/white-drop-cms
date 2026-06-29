import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import authStore from "../../../zustand/Store/authStore";

const ResetPasswordForm = ({ email }) => {
  const resetPassword = authStore((state) => state.resetPassword);
  const verifiedUser = authStore((state) => state.verifiedUser);

  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResetPassword = async () => {
    try {
        console.log("verifiedUser", verifiedUser);
console.log("registerData", registerData);
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

      const payload = {
        email: email,
        password: registerData.password,
        otp: verifiedUser.otp,
      };
      console.log("payload", payload);
      
      const res = await resetPassword(payload);
      toast.success(res?.message || "Password reset successful");
      navigate("/");
    } catch (error) {
  console.log("Reset Error:", error);
  console.log("Response:", error?.response);
  console.log("Data:", error?.response?.data);

  toast.error(
    error?.response?.data?.message || "Password reset failed"
  );
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
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={registerData.password}
          onChange={handleChange}
          className="w-full rounded-2xl bg-white/20 border border-white/30
          py-3 px-5 text-white placeholder:text-white/60
          outline-none backdrop-blur-md focus:border-cyan-300"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={registerData.confirmPassword}
          onChange={handleChange}
          className="w-full rounded-2xl bg-white/20 border border-white/30
          py-3 px-5 text-white placeholder:text-white/60
          outline-none backdrop-blur-md focus:border-cyan-300"
        />

        <button
          onClick={handleResetPassword}
          className="w-full rounded-2xl bg-gradient-to-r
          from-yellow-500 to-yellow-400 py-3 text-white
          font-semibold shadow-lg transition hover:scale-[1.02] cursor-pointer"
        >
          Reset Password
        </button>
      </div>
    </>
  );
};

export default ResetPasswordForm;
