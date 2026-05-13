import { useTheme } from "@/lib/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeSelector() {
  const { isDark, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative p-1 rounded-full border border-border bg-background/70 hover:border-primary transition-all duration-300"
    >
      <div className="relative w-12 h-6 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-0 flex items-center transition-all duration-500 ease-out ${
            isDark ? "bg-[#1a120b]" : "bg-gradient-to-r from-amber-100 to-amber-50"
          }`}
        >
          <div
            className={`absolute left-0.5 w-5 h-5 rounded-full shadow-lg transition-all duration-500 ease-out flex items-center justify-center ${
              isDark
                ? "translate-x-6 bg-[#d4a061]"
                : "translate-x-0 bg-[#1a120b]"
            }`}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-[#1a0d07]" />
            ) : (
              <Sun className="w-3 h-3 text-amber-100" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
