import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import App from "./App.tsx";
import "./index.css";
import { useAuth } from "./store/auth";

const AppWrapper = () => {
  const loadUser = useAuth((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <App />;
};

createRoot(document.getElementById("root")!).render(<AppWrapper />);