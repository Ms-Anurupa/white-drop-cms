import loaderStore from "../zustand/Store/loaderStore";

const GlobalLoader = () => {
  const { loading } = loaderStore();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="relative flex flex-col items-center gap-5">
        {/* Outer Ring */}
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rounded-full border-[6px] border-white/10"></div>

          <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-blue-500 border-r-cyan-400 animate-spin"></div>

          <div className="absolute inset-3 rounded-full border-[5px] border-transparent border-b-indigo-500 border-l-sky-400 animate-spin [animation-direction:reverse] [animation-duration:1.5s]"></div>

          {/* Center Dot */}
          <div className="absolute inset-[35%] rounded-full bg-white shadow-[0_0_30px_#60a5fa]"></div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center">
          <h2 className="text-white text-xl font-bold tracking-wide">
            Signing In
          </h2>

          <p className="text-gray-300 text-sm mt-1">
            Please wait...
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2 mt-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></span>
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce delay-150"></span>
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;