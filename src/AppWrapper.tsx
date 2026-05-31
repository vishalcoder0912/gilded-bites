import { useEffect } from "react";
import App from "./App";
import { useAuth } from "./store/auth";

export default function AppWrapper() {
  const loadUser = useAuth((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <App />;
}
