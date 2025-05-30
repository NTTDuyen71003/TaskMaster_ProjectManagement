import { useEffect, useState } from "react";

export function useSidebarMode() {
  const [iconOnly, setIconOnly] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIconOnly(document.body.classList.contains("sidebar-icon-only"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    setIconOnly(document.body.classList.contains("sidebar-icon-only"));

    return () => observer.disconnect();
  }, []);

  return iconOnly;
}
