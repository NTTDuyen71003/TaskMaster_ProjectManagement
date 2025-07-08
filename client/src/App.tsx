import { useEffect } from "react";
import AppRoutes from "./routes";
import i18n from "./languages/i18n";

function App() {
  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId");

    if (currentUserId) {
      // Handle theme
      const theme = localStorage.getItem(`theme-${currentUserId}`) || "light";
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Handle language - only change to supported languages
      const lang = localStorage.getItem(`language-${currentUserId}`) || "en";
      const supportedLanguages = ['en', 'vi']; 
      
      if (supportedLanguages.includes(lang)) {
        i18n.changeLanguage(lang);
      } else {
        // Fallback to English if saved language is not supported
        i18n.changeLanguage("en");
        localStorage.setItem(`language-${currentUserId}`, "en"); // Update stored value
      }
    } else {
      // Default fallback when no user is logged in
      document.documentElement.classList.remove("dark");
      i18n.changeLanguage("en");
    }
  }, []);

  return <AppRoutes />;
}

export default App;