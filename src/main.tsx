import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import App from "./App.tsx";
import "./index.css";
import { useAuth } from "./store/auth";
import { ThemeProvider } from "./lib/ThemeProvider.tsx";

const AppWrapper = () => {
  const loadUser = useAuth((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(<AppWrapper />);