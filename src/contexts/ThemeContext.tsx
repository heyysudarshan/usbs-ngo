import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isThemeSelected: boolean;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("selectedTheme") as Theme) || "light";
  });
  const [isThemeSelected, setIsThemeSelected] = useState(() => {
    return localStorage.getItem("themeSelected") === "true";
  });

  const effectiveTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setIsThemeSelected(true);
    localStorage.setItem("selectedTheme", newTheme);
    localStorage.setItem("themeSelected", "true");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isThemeSelected,
        effectiveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { ThemeContext };
