import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspaceMutationFn } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import useGetAllWorkspacesQuery from "@/hooks/api/use-get-all-workspaces";

export default function CreateWorkspaceForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
  });

  // Get existing workspaces to check for duplicates
  const { data: workspacesResponse } = useGetAllWorkspacesQuery();
  const existingWorkspaces = workspacesResponse?.workspaces || [];

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: t("sidebar-create-workspace-name-require"),
    }),
    description: z.string().trim(),
  }).superRefine((data, ctx) => {
    const normalizedName = data.name.toLowerCase().trim();

    const isDuplicate = existingWorkspaces.some(
      (workspace: any) =>
        workspace.name.toLowerCase().trim() === normalizedName
    );

    if (isDuplicate) {
      ctx.addIssue({
        path: ["name"],
        code: z.ZodIssueCode.custom,
        message: t("sidebar-create-workspace-name-duplicate"),
      });
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    // Additional client-side check before submission
    if (existingWorkspaces && Array.isArray(existingWorkspaces)) {
      const normalizedName = values.name.toLowerCase().trim();

      const isDuplicate = existingWorkspaces.some(
        (workspace: any) =>
          workspace.name.toLowerCase().trim() === normalizedName
      );

      if (isDuplicate) {
        form.setError("name", {
          type: "manual",
          message: t("sidebar-create-workspace-name-duplicate"),
        });
        return;
      }
    }

    mutate(values, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });
        toast({
          title: t("navbar-create-project-success"),
          description: t("sidebar-create-workspace-success-desc"),
          variant: "success",
          duration: 2500,
        });
        const workspace = data.workspace;
        onClose();
        navigate(`/workspace/${workspace._id}`);
      },
      onError: (error: any) => {
        if (error?.response?.status === 409 || error?.message?.includes("duplicate")) {
          form.setError("name", {
            type: "manual",
            message: t("sidebar-create-workspace-name-exists"),
          });
        } else {
          toast({
            title: t("memberdashboard-changerole-error"),
            description: t("navbar-create-project-error-desc"),
            variant: "destructive",
            duration: 2500,
          });
        }
      },
    });
  };

  return (
    <>
      <div className="card">
        <div className="card-body bg-sidebar">
          <h4 className="card-title text-center font-bold">{t("sidebar-createworkspace-title")}</h4>
          <Form {...form}>
            <form className="forms-sample" onSubmit={form.handleSubmit(onSubmit)}>

              <div className="form-group">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <>
                      <label htmlFor="exampleInputName1">{t("sidebar-createworkspace-name")}</label>
                      <input
                        type="text"
                        className={`form-control bg-sidebar-input border-sidebar-border text-black dark:text-white ${fieldState.error ? 'border-red-500' : ''
                          }`}
                        id="exampleInputName1"
                        placeholder={t("sidebar-createworkspace-placeholdername")}
                        maxLength={12}
                        {...field}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          {fieldState.error && (
                            <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                          )}
                        </div>
                        <span className="text-sm text-muted">
                          {field.value?.length || 0}/12
                        </span>
                      </div>
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
                        {...field}
                      ></textarea>
                    </>
                  )}
                />
              </div>

              <button
                disabled={isPending}
                type="submit"
                className="btn bg-sidebar-frameicon mr-2"
              >
                {isPending && <Loader />}
                {t("sidebar-createworkspace-btn")}
              </button>
              <button className="btn btn-dark" type="button" onClick={onClose} >{t("sidebar-createworkspace-cancelbtn")}</button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}