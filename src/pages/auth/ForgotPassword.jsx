/* eslint-disable no-unused-vars */
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/images/admin-poster.jpg";
import logo from "../../assets/images/logo_nobg.png";
import authStore from "../../zustand/Store/authStore";
import { toast } from "react-toastify";
import ForgotPasswordEmail from "./components/ForgotPasswordEmail";
import ForgotPasswordOtp from "./components/ForgotPasswordOtp";
import ResetPasswordForm from "./components/ResetPasswordForm";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [forgotPasswordStage, setForgotPasswordStage] = useState("EMAIL");

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="w-full max-w-md z-10">
        <div
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px]
          border border-white/20 bg-white/10 backdrop-blur-2xl
          shadow-[0_8px_32px_rgba(31,38,135,0.37)]
          px-6 sm:px-8 py-8"
        >
          {/* Glow */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl" />

          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-2 rounded-full shadow-xl">
              <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
            </div>
          </div>

          {/* Screens */}
          {forgotPasswordStage === "EMAIL" && (
            <ForgotPasswordEmail
              email={email}
              setEmail={setEmail}
              onSuccess={() => setForgotPasswordStage("OTP")}
            />
          )}

          {forgotPasswordStage === "OTP" && (
            <ForgotPasswordOtp
              email={email}
              onSuccess={() => setForgotPasswordStage("RESET_PASSWORD")}
            />
          )}

          {forgotPasswordStage === "RESET_PASSWORD" && (
            <ResetPasswordForm email={email} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
