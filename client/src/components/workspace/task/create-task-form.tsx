import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { getAvatarColor, getAvatarFallbackText, transformOptions } from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-member";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";


export default function CreateTaskForm(props: {
  projectId?: string;
  onClose: () => void;
}) {
  const { projectId, onClose } = props;
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { data: menberData } = useGetWorkspaceMembers(workspaceId);

  const { data, isLoading } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    skip: !!projectId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createTaskMutationFn,
  })

  const projects = data?.projects || [];
  const members = menberData?.members || [];
  const { t } = useTranslation();


  //Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-1">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });


  // Workspace Memebers
  const membersOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });


  const formSchema = z.object({
    title: z.string().trim().min(1, {
      message: "Title is required",
    }),
    description: z.string().trim(),
    projectId: z.string().trim().min(1, {
      message: "Project is required",
    }),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
      {
        required_error: "Status is required",
      }
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
      {
        required_error: "Priority is required",
      }
    ),
    assignedTo: z.string().trim().min(1, {
      message: "AssignedTo is required",
    }),
    dueDate: z.date({
      required_error: "A date of birth is required.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: projectId ? projectId : "",
    },
  });

  const taskStatusList = Object.values(TaskStatusEnum);
  const taskPriorityList = Object.values(TaskPriorityEnum); // ["LOW", "MEDIUM", "HIGH", "URGENT"]

  const statusOptions = transformOptions(taskStatusList);
  const priorityOptions = transformOptions(taskPriorityList);


  //nút tạo task
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    const payload = {
      workspaceId,
      projectId: values.projectId,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["project-analytics", projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["all-tasks", workspaceId],
        });
        toast({
          title: "Success",
          description: "Task created successfully",
          variant: "success",
        });
        onClose();
        // setTimeout(() => onClose(), 100);
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
    <div className="card">
      <div className="card-body bg-sidebar">
        <h4
          className="card-title text-center font-bold"
        >
          {t("taskboard-createbtn")}
        </h4>
        <Form {...form}>
          <form className="forms-sample" onSubmit={form.handleSubmit(onSubmit)}>

            <div className="form-group">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <>
                    <label htmlFor="exampleInputName1">{t("taskboard-form-create-title")}</label>
                    <input
                      type="text"
                      className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white rounded-lg"
                      id="exampleInputName1"
                      placeholder={t("taskboard-form-create-title-placeholder")}
                      {...field}
                    />
                  </>
                )}
              />
            </div>

            {/* {Description} */}
            <div className="form-group">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <>
                    <label htmlFor="exampleTextarea1">
                      {t("taskboard-create-task-description")}
                    </label>
                    <textarea
                      className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white rounded-lg"
                      id="exampleTextarea1"
                      rows={4}
                      placeholder={t("taskboard-form-create-task-description-placeholder")}
                      {...field}
                    ></textarea>
                  </>
                )}
              />
            </div>

            {/*Members AssigneeTo*/}
            <div className="form-group">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <label htmlFor="exampleSelectGender">{t("projectboard-task-assign")}</label>
                      <select className="form-control" id="exampleSelectGender" defaultValue="">
                        <option value="" disabled>
                          Select an assignee
                        </option>
                        {/* <option>Male</option>
                      <option>Female</option> */}
                        <SelectContent>
                          <div className="w-full max-h-[200px]overflow-y-auto scrollbar">
                            {membersOptions?.map((option) => (
                              <SelectItem
                                className="cursor-pointer"
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </select>
                    </Select>
                  </>
                )}
              />
            </div>

            {/* {Due Date} */}
            <div className="!mt-2">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full flex-1 pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={
                            (date) =>
                              date <
                              new Date(new Date().setHours(0, 0, 0, 0)) || // Disable past dates
                              date > new Date("2100-12-31") //Prevent selection beyond a far future date
                          }
                          initialFocus
                          defaultMonth={new Date()}
                          fromMonth={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {Status} */}
            <div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className="!text-muted-foreground !capitalize"
                            placeholder="Select a status"
                          />
                        </SelectTrigger>
                      </FormControl>

                      {/* lay du lieu trang thai tu db de add vao task */}
                      <SelectContent>
                        {statusOptions?.map((status) => (
                          <SelectItem
                            className="!capitalize"
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>

                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {Priority} */}
            <div>
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions?.map((priority) => (
                          <SelectItem
                            className="!capitalize"
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* nút tạo task */}
            <Button
              className="flex place-self-end  h-[40px] text-white font-semibold"
              type="submit"
              disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              Create
            </Button>

          </form>
        </Form>
      </div>
    </div>
  );
}
