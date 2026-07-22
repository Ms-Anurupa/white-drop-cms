import { Loader2 } from "lucide-react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex min-h-[65vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-sm border border-gray-100">
        <Loader2
          className="h-10 w-10 animate-spin text-indigo-600"
          strokeWidth={2.5}
        />

        <p className="text-sm font-medium text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default Loader;