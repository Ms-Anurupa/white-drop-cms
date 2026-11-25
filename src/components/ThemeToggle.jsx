import { Sun, Moon, Monitor } from "lucide-react";
import useThemeStore from "@/zustand/Store/themeStore";

const THEME_OPTIONS = [
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
  { value: "system", label: "System theme", icon: Monitor },
];

const ThemeToggle = ({ className = "" }) => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-700 dark:bg-slate-800/90 ${className}`}
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={active}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all ${
              active
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
