import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useStore } from "@/store/store";
import { useTranslation } from "react-i18next";

const LogoutDialog = (props: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, setIsOpen } = props;
  const navigate = useNavigate();
  const { clearAccessToken } = useStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: () => {
      queryClient.resetQueries({
        queryKey: ["authUser"],
      });
      clearAccessToken();
      navigate("/");
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: t("memberdashboard-changerole-error"),
        description: t("navbar-create-project-error-desc"),
        variant: "destructive",
        duration: 2500,
      });
    },
  });

  // Handle logout action
  const handleLogout = useCallback(() => {
    // Lưu theme của người dùng trước khi logout
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      const theme = localStorage.getItem(`theme-${currentUserId}`);
      localStorage.setItem("savedTheme", theme || "light"); // Lưu theme đã chọn
    }
    localStorage.removeItem("currentUserId");

    // Tiến hành logout
    if (isPending) return;
    mutate();
  }, [isPending, mutate]);


  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-md card card-body bg-sidebar">
          <DialogHeader>
            <DialogTitle>{t("navbar-logout-title")}</DialogTitle>
            <DialogDescription>{t("navbar-logout-description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t("sidebar-createworkspace-cancelbtn")}
            </Button>
            <Button disabled={isPending} type="button" onClick={handleLogout}>
              {isPending && <Loader className="animate-spin" />}
              {t("navbar-logout-confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutDialog;
