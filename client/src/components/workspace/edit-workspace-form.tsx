import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { useAuthContext } from "@/context/auth-provider";
import { useEffect } from "react";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editWorkspaceMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { Permissions } from "@/constant";
import { useTranslation } from "react-i18next";

export default function EditWorkspaceForm() {

  const { workspace, hasPermission } = useAuthContext();
  const canEditWorkspace = hasPermission(Permissions.EDIT_WORKSPACE);
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate, isPending } = useMutation({
    mutationFn: editWorkspaceMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Workspace name is required",
    }),
    description: z.string().trim(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  useEffect(() => {
    if (workspace) {
      form.setValue("name", workspace.name);
      form.setValue("description", workspace?.description || "");
    }
  }, [form, workspace]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId: workspaceId,
      data: { ...values },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["workspace"],
        });
        queryClient.invalidateQueries({
          queryKey: ["userWorkspaces"],
        });

        toast({
          title: t("settingboard-edit-success"),
          description: t("settingboard-edit-success-description"),
          variant: "success",
          duration: 2500,
        });
      },
      onError: () => {
        toast({
          title: t("settingboard-edit-error"),
          description: t("settingboard-edit-error-description"),
          variant: "destructive",
          duration: 2500,
        });
      },
    });
  };


  return (
    <>
      <div className="col-md-12">
        <h4 className="card-title font-bold">{t("settingboard-edit-workspace")}</h4>
        <Form {...form}>
          <form className="forms-sample" onSubmit={form.handleSubmit(onSubmit)}>

            <div className="form-group">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <>
                    <label htmlFor="exampleInputName1">{t("sidebar-createworkspace-name")}</label>
                    <input
                      type="text"
                      className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white"
                      id="exampleInputName1"
                      placeholder={t("sidebar-createworkspace-placeholdername")}
                      disabled={!canEditWorkspace}
                      {...field}
                    />
                  </>
                )}
              />
            </div>

            <div className="form-group">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <>
                    <label htmlFor="exampleTextarea1">
                      {t("sidebar-createworkspace-decription")}
                    </label>
                    <textarea
                      className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white"
                      id="exampleTextarea1"
                      rows={4}
                      placeholder={t("sidebar-createworkspace-placeholderdecription")}
                      disabled={!canEditWorkspace}
                      {...field}
                    ></textarea>
                  </>
                )}
              />
            </div>

            <button
              disabled={isPending}
              type="submit"
              className="btn btn-bg mr-2"
            >
              {isPending && <Loader />}
              {t("settingboard-edit-btn")}
            </button>
          </form>
        </Form>
      </div>
    </>
  );
}
