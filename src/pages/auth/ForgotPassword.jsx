import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import bgImage from "../../assets/images/admin-poster.jpg";
import logo from "../../assets/images/White Drop Logo-01.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    console.log(email);
    setSent(true);
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="w-full max-w-md z-10">
        <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px]
          border border-white/20 bg-white/10 backdrop-blur-2xl
          shadow-[0_8px_32px_rgba(31,38,135,0.37)]
          px-6 sm:px-8 py-8"
        >
          {/* glow */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-400/30 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl"></div>

          {/* back */}
          <button
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>

          {/* logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-2 rounded-full shadow-xl">
              <img
                src={logo}
                alt="Logo"
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>

          {/* title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
              Forgot Password
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              Enter your email to reset your password
            </p>
          </div>

          {!sent ? (
            <>
              {/* email input */}
              <div className="relative mb-5">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-white/20 border border-white/30
                  py-3 pl-5 pr-12 text-white placeholder:text-white/60
                  outline-none backdrop-blur-md focus:border-cyan-300"
                />
                <Mail
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
                  size={18}
                />
              </div>

              {/* button */}
              <button
                onClick={handleSubmit}
                className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400
                py-3 text-white cursor-pointer font-semibold shadow-lg transition hover:scale-[1.02]"
              >
                Send Reset Link
              </button>
            </>
          ) : (
            <div className="text-center text-white/90">
              <p className="mb-4">
                If this email exists, a reset link has been sent.
              </p>
              <button
                onClick={() => navigate("/")}
                className="text-cyan-300 hover:underline cursor-pointer"
              >
                Go back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;