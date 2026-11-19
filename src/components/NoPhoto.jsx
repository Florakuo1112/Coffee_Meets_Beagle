import { CameraOff } from "lucide-react";

function NoPhoto({ text, className = "", onClick }) {
  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/40 text-pink-400 transition ${className}`}
      onClick={onClick}
    >
      <CameraOff />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

export default NoPhoto;
