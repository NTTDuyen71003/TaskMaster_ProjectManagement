import { useEffect } from "react";
import AppRoutes from "./routes";
import i18n from "./languages/i18n";

function App() {
  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId");

    if (currentUserId) {
      // Set theme
      const theme = localStorage.getItem(`theme-${currentUserId}`) || "light";
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Set language
      const lang = localStorage.getItem(`language-${currentUserId}`) || "en";
      i18n.changeLanguage(lang);
    } else {
      document.documentElement.classList.remove("dark");
      i18n.changeLanguage("en");
    }
  }, []);

  return <AppRoutes />;
}

export default App;
