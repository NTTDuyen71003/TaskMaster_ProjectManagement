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

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Project title is required",
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

  const handleEmojiSelection = (emoji: string) => {
    setEmoji(emoji);
    setEmojiPickerOpen(false);
  };


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      data: {
        emoji,
        ...values,
      },
    };
    mutate(payload, {
      onSuccess: (data) => {
        const project = data.project;
        queryClient.invalidateQueries({
          queryKey: ["allprojects", workspaceId],
        })
        toast({
          title: "Success",
          description: "Project created successfully",
          variant: "success",
        });
        navigate(`/workspace/${workspaceId}/project/${project._id}`);
        setTimeout(() => onClose(), 500);
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
                  render={({ field }) => (
                    <>
                      <label htmlFor="exampleInputName1">{t("navbar-create-project-name")}</label>
                      <input
                        type="text"
                        className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white"
                        id="exampleInputName1"
                        placeholder={t("navbar-create-project-placeholder-name")}
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
                className="btn btn-bg mr-2"
              >
                {isPending && <Loader />}
                {t("navbar-create-project-btn")}
              </button>
              <button className="btn btn-dark" type="button" onClick={onClose} >{t("sidebar-createworkspace-cancelbtn")}</button>
            </form>
          </Form>
        </div>
      </div >
    </>
  );
}
