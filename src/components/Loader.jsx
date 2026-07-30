import { useEffect, useState } from "react";

const Loader = ({ text = "Loading" }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ minHeight: "65vh" }}
      className="relative flex w-full items-center justify-center overflow-hidden bg-gray-50"
    >
      <style>{`
        @keyframes loader-rotate {
          to { transform: rotate(360deg); }
        }
        @keyframes loader-dash {
          0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 100, 200; stroke-dashoffset: -25; }
          100% { stroke-dasharray: 100, 200; stroke-dashoffset: -124; }
        }
        @keyframes loader-glow {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes loader-fade-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes loader-shimmer {
          to { background-position: -200% center; }
        }
        .loader-svg {
          animation: loader-rotate 1.6s linear infinite;
        }
        .loader-arc {
          animation: loader-dash 1.5s ease-in-out infinite;
        }
        .loader-glow {
          animation: loader-glow 2.4s ease-in-out infinite;
        }
        .loader-card {
          animation: loader-fade-in 0.4s ease-out;
        }
        .loader-text {
          background: linear-gradient(
            90deg,
            #9ca3af 0%,
            #9ca3af 40%,
            #4338ca 50%,
            #9ca3af 60%,
            #9ca3af 100%
          );
          background-size: 200% auto;
          background-position: 100% center;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: loader-shimmer 2.2s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .loader-svg { animation-duration: 3s; }
          .loader-arc { animation: none; stroke-dasharray: 80, 200; }
          .loader-glow { animation: none; opacity: 0.4; }
          .loader-card { animation: none; }
          .loader-text {
            animation: none;
            background: none;
            -webkit-background-clip: initial;
            background-clip: initial;
            color: #6b7280;
          }
        }
      `}</style>

      <div className="loader-card relative flex flex-col items-center gap-6 rounded-2xl border border-gray-100 bg-white px-12 py-10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(79,70,229,0.18)]">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div
            className="loader-glow absolute h-14 w-14 rounded-full bg-indigo-400 blur-xl"
            aria-hidden="true"
          />
          <svg
            className="loader-svg relative h-12 w-12"
            viewBox="0 0 50 50"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>
            <circle
              className="loader-arc"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="url(#loader-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="loader-text flex items-baseline text-sm font-semibold tracking-wide">
          <span>{text}</span>
          <span className="inline-block w-4 text-left">{dots}</span>
        </p>
      </div>

      <span className="sr-only">{text}</span>
    </div>
  );
};

export default Loader;