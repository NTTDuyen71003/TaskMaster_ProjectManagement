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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });

        const workspace = data.workspace;
        onClose();
        navigate(`/workspace/${workspace._id}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
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
                        className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white"
                        id="exampleInputName1"
                        placeholder={t("sidebar-createworkspace-placeholdername")}
                        {...field}
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                      )}
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
                className="btn btn-bg mr-2"
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
