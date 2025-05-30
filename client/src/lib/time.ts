import i18n from "@/languages/i18n";
const { t } = i18n;

export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) {
    return t("timeAgo.justNow");
  } else if (diffInMinutes < 60) {
    return t("timeAgo.minutesAgo", { count: diffInMinutes });
  } else if (diffInHours < 24) {
    return t("timeAgo.hoursAgo", { count: diffInHours });
  } else if (diffInDays < 7) {
    return t("timeAgo.daysAgo", { count: diffInDays });
  } else if (diffInWeeks < 4) {
    return t("timeAgo.weeksAgo", { count: diffInWeeks });
  } else if (diffInMonths < 12) {
    return t("timeAgo.monthsAgo", { count: diffInMonths });
  } else {
    return t("timeAgo.yearsAgo", { count: diffInYears });
  }
};
