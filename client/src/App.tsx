import AppRoutes from "./routes";
import i18n from "./languages/i18n";
import { useEffect } from "react";

function App() {
    useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      const lang = localStorage.getItem(`language-${currentUserId}`);
      i18n.changeLanguage(lang || "en");
    } else {
      i18n.changeLanguage("en");
    }
  }, []);
  return <AppRoutes />;
}

export default App;
