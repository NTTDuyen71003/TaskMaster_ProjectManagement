import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import EmojiPickerComponent from "@/components/emoji-picker";
import { ProjectType } from "@/types/api.type";
import { editProjectMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";


export default function EditProjectForm(props: {
  project?: ProjectType;
  onClose: () => void;
}) {
  const { project, onClose } = props;
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const [emoji, setEmoji] = useState("📊");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const projectId = project?._id as string;
  const { t } = useTranslation();

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

    // Check for duplicates but EXCLUDE the current project being edited
    const isDuplicate = existingProjects.some(
      (existingProject: any) =>
        existingProject._id !== projectId && // Exclude current project
        existingProject.name.toLowerCase().trim() === normalizedName &&
        existingProject.emoji === normalizedEmoji
    );

    if (isDuplicate) {
      ctx.addIssue({
        path: ["name"],
        code: z.ZodIssueCode.custom,
        message: t("navbar-create-name-require"),
      });
    }
  });


  const { mutate, isPending } = useMutation({
    mutationFn: editProjectMutationFn,
  });


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      emoji: project?.emoji || "📊", // Use project emoji if available
    },
  });


  //lay du lieu project hien thi len form
  useEffect(() => {
    if (project) {
      setEmoji(project.emoji);
      form.setValue("name", project.name);
      form.setValue("description", project.description);
      form.setValue("emoji", project.emoji);
    }
  }, [form, project]);

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji);
    setEmojiPickerOpen(false);
    form.setValue("emoji", emoji);
  };

  //update project
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    // Additional validation in onSubmit (also excluding current project)
    if (existingProjects && Array.isArray(existingProjects)) {
      const normalizedName = values.name.toLowerCase().trim();

      const isDuplicate = existingProjects.some(
        (existingProject: any) =>
          existingProject._id !== projectId && // Exclude current project
          existingProject.name.toLowerCase().trim() === normalizedName &&
          existingProject.emoji === values.emoji
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
      projectId,
      workspaceId,
      data: { ...values },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["singleProject", projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["allprojects", workspaceId],
        });
        toast({
          title: t("navbar-create-project-success"),
          description: t("settingboard-edit-success-description"),
          variant: "success",
        });
        setTimeout(() => onClose(), 100);
      },
      onError: () => {
        toast({
          title: t("settingboard-edit-error"),
          description: t("settingboard-edit-error-description"),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <div className="card">
        <div className="card-body bg-sidebar">
          <h4 className="card-title text-center font-bold">{t("projectboard-edit-title")}</h4>
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
                {t("projectboard-edit-updatebtn")}
              </button>
              <button className="btn btn-dark" type="button" onClick={onClose} >{t("sidebar-createworkspace-cancelbtn")}</button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}