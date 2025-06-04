import { useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onChange(!checked);
  };

  return (
    <button
      onClick={handleToggle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label="Toggle theme"
      className={`
        relative flex items-center justify-center h-10 w-10 rounded-full transition-transform duration-200
        focus:outline-none focus:ring-none focus:ring-none focus:ring-offset-none
        ${isPressed ? "scale-95" : "hover:scale-105"}
        ${checked ? "bg-black text-slate-200" : "bg-slate-200 text-black"}
      `}>
      <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
        <Sun
          className={`h-5 w-5 transition-opacity duration-300 ${
            checked ? "opacity-0 scale-50" : "opacity-100 scale-100"
          }`}
        />
        <Moon
          className={`h-5 w-5 absolute transition-opacity duration-300 ${
            checked ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        />
      </span>
    </button>
  );
}
