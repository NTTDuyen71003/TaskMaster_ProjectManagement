import { enUS, vi } from "date-fns/locale";
import i18n from "@/languages/i18n";

export function getDateFnsLocale() {
  const lang = i18n.language || "en";
  return lang === "vi" ? vi : enUS;
}