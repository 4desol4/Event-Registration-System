import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-10 w-10 items-center justify-center rounded-full
                 border border-brand-dark-200 dark:border-brand-dark-700
                 bg-white/70 dark:bg-brand-dark-800/70 backdrop-blur-sm
                 transition-all duration-300 hover:scale-105 hover:border-brand-lime-500
                 active:scale-95"
    >
      <Sun
        className={`absolute h-4.5 w-4.5 text-brand-lime-600 transition-all duration-300 ${
          theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
        size={18}
      />
      <Moon
        className={`absolute h-4.5 w-4.5 text-brand-lime-400 transition-all duration-300 ${
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
        size={18}
      />
    </button>
  );
}
