import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import EmojiPickerComponent from "@/components/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProjectMutationFn } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";


export default function CreateProjectForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const [emoji, setEmoji] = useState("📊");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { t } = useTranslation();

  const { mutate, isPending } = useMutation({
    mutationFn: createProjectMutationFn,
  });

  // Get existing projects to check for duplicates
  const { data: projectsResponse } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize: 100, // Get a large number to check all projects
    pageNumber: 1,
  });

  const existingProjects = projectsResponse?.projects || [];

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: t("navbar-create-title-require"),
    }),
    description: z.string().trim(),
    emoji: z.string().trim().min(1)
  }).superRefine((data, ctx) => {
    const normalizedName = data.name.toLowerCase().trim();
    const normalizedEmoji = data.emoji;

    const isDuplicate = existingProjects.some(
      (project: any) =>
        project.name.toLowerCase().trim() === normalizedName &&
        project.emoji === normalizedEmoji
    );

    if (isDuplicate) {
      ctx.addIssue({
        path: ["name"],
        code: z.ZodIssueCode.custom,
        message: t("navbar-create-name-require"),
      });
    }
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      emoji,
    },
  });

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji);
    setEmojiPickerOpen(false);
    form.setValue("emoji", emoji);
  };


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    if (existingProjects && Array.isArray(existingProjects)) {
      const normalizedName = values.name.toLowerCase().trim();

      const isDuplicate = existingProjects.some(
        (project: any) =>
          project.name.toLowerCase().trim() === normalizedName &&
          project.emoji === emoji // Chỉ cấm nếu emoji cũng giống
      );

      if (isDuplicate) {
        form.setError("name", {
          type: "manual",
          message: t("navbar-create-name-require"),
        });
        return;
      }
    }

    const payload = {
      workspaceId,
      data: {
        ...values,
      },
    };

    mutate(payload, {
      onSuccess: (data) => {
        const project = data.project;
        queryClient.invalidateQueries({
          queryKey: ["allprojects", workspaceId],
        });
        toast({
          title: t("navbar-create-project-success"),
          description: t("navbar-create-project-success-desc"),
          variant: "success",
          duration: 2500,
        });
        navigate(`/workspace/${workspaceId}/project/${project._id}`);
        setTimeout(() => onClose(), 500);
      },
      onError: (error: any) => {
        if (error?.response?.status === 409 || error?.message?.includes("duplicate")) {
          form.setError("name", {
            type: "manual",
            message: t("navbar-create-name-require"),
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
          <h4 className="card-title text-center font-bold">{t("navbar-create-project-title1")}</h4>
          <Form {...form}>
            <form className="forms-sample" onSubmit={form.handleSubmit(onSubmit)}>

              <div className="form-group">
                <div className="flex flex-col items-center text-center space-y-2">
                  <label htmlFor="exampleInputName1">{t("navbar-create-project-icon")}</label>
                  <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="font-normal size-[60px] !p-2 !shadow-none items-center rounded-full"
                      >
                        <span className="text-4xl">{emoji}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="!p-0 z-[9999]">
                      <EmojiPickerComponent onSelectEmoji={handleEmojiSelection} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="form-group">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <>
                      <label htmlFor="exampleInputName1">{t("navbar-create-project-name")}</label>
                      <input
                        type="text"
                        className={`form-control bg-sidebar-input border-sidebar-border text-black dark:text-white ${fieldState.error ? 'border-red-500' : ''
                          }`}
                        id="exampleInputName1"
                        placeholder={t("navbar-create-project-placeholder-name")}
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
                        {t("navbar-create-project-description")}
                      </label>
                      <textarea
                        className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white"
                        id="exampleTextarea1"
                        rows={4}
                        placeholder={t("navbar-create-project-placeholder-description")}
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
                {t("navbar-create-project-btn")}
              </button>
              <button className="btn btn-dark" type="button" onClick={onClose} >{t("sidebar-createworkspace-cancelbtn")}</button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
