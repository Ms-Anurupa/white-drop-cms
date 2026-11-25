import { create } from "zustand";

const STORAGE_KEY = "theme";
const VALID_THEMES = new Set(["light", "dark", "system"]);

const getSystemTheme = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (theme) => {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return getSystemTheme();
};

const getSavedTheme = () => {
  if (typeof window === "undefined") return "system";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.has(saved) ? saved : "system";
  } catch {
    return "system";
  }
};

const applyThemeToDom = (resolved) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
};

const initialTheme = getSavedTheme();
const initialResolved = resolveTheme(initialTheme);
applyThemeToDom(initialResolved);

const useThemeStore = create((set) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,

  setTheme: (nextTheme) => {
    const validTheme = VALID_THEMES.has(nextTheme) ? nextTheme : "system";
    try {
      window.localStorage.setItem(STORAGE_KEY, validTheme);
    } catch {
      // Ignore storage errors (e.g. private browsing)
    }
    const resolved = resolveTheme(validTheme);
    applyThemeToDom(resolved);
    set({ theme: validTheme, resolvedTheme: resolved });
  },
}));

if (typeof window !== "undefined" && window.matchMedia) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    const { theme } = useThemeStore.getState();
    if (theme === "system") {
      const resolved = getSystemTheme();
      applyThemeToDom(resolved);
      useThemeStore.setState({ resolvedTheme: resolved });
    }
  };
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handleSystemChange);
  } else if (typeof media.addListener === "function") {
    media.addListener(handleSystemChange);
  }
}

export { useThemeStore };
export default useThemeStore;
