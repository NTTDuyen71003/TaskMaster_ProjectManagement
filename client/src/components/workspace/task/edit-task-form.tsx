import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Loader, Search } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
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
import { Calendar } from "@/components/ui/calendar";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-member";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { TaskType } from "@/types/api.type";
import { getDateFnsLocale } from "@/languages/getDateFnsLocale";
import i18n from "@/languages/i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";


export default function EditTaskForm(props: {
    task: TaskType;
    projectId?: string;
    onClose: () => void;
}) {
    const { task, projectId, onClose } = props;
    const workspaceId = useWorkspaceId();
    const queryClient = useQueryClient();
    const { data: memberData } = useGetWorkspaceMembers(workspaceId);
    const lang = i18n.language;
    const dateLocale = getDateFnsLocale();
    const formatStr = lang === "vi" ? "dd'/'MM'/'yyyy" : "PPP";
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchMem, setSearchMem] = useState("");
    const { t } = useTranslation();


    const { data } = useGetProjectsInWorkspaceQuery({
        workspaceId,
        pageSize: 100,
        skip: !!projectId,
    });


    const { mutate, isPending } = useMutation({
        mutationFn: editTaskMutationFn,
    });


    const projects = data?.projects || [];
    const members = memberData?.members || [];


    // Workspace Projects
    const projectOptions = projects?.map((project) => {
        return {
            label: `${project.emoji} ${project.name}`,
            value: project._id,
        };
    });


    // Workspace Members
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
            message: t("taskboard-create-task-title-require"),
        }),
        description: z.string().trim(),
        projectId: z.string().trim().min(1, {
            message: t("taskboard-create-task-project-require"),
        }),
        assignedTo: z.string().trim().min(1, {
            message: t("taskboard-create-task-assignedto-require"),
        }),
        dueDate: z.date({
            required_error: t("taskboard-create-task-duedate-require"),
        }),
        status: z.enum(
            Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum],
            {
                required_error: t("taskboard-create-task-status-require"),
            }
        ),
        priority: z.enum(
            Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum],
            {
                required_error: t("taskboard-create-task-priority-require"),
            }
        ),
    });


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: task.title || "",
            description: task.description || "",
            projectId: projectId || task.project?._id || "",
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo?._id || "",
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        },
    });


    const taskStatusList = Object.values(TaskStatusEnum);
    const statusOptions = taskStatusList.map(status => ({
        value: status,
        label: t(`status-${status.toLowerCase().replace('_', '-')}`)
    }));


    const taskPriorityList = Object.values(TaskPriorityEnum); // ["LOW", "MEDIUM", "HIGH"]
    const priorityOptions = taskPriorityList.map(priority => ({
        value: priority,
        label: t(`priority-${priority.toLowerCase().replace('_', '-')}`)
    }));


    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (isPending) return;

        const effectiveProjectId = projectId || task.project?._id;

        // Check if projectId is valid
        if (!effectiveProjectId) {
            toast({
                title: t("settingboard-edit-error"),
                description: t("taskboard-update-task-error-desc"),
                variant: "destructive",
                duration: 2500,
            });
            return;
        }

        const payload = {
            workspaceId,
            taskId: task._id,
            projectId: effectiveProjectId, // Now guaranteed to be string
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
                    title: t("navbar-create-project-success"),
                    description: t("taskboard-update-task-success-desc"),
                    variant: "success",
                    duration: 2500,
                });
                onClose();
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


    const filteredOptions = projectOptions?.filter((option) => {
        const projectName =
            typeof option.label === "string"
                ? option.label
                : (projects.find((p) => p._id === option.value)?.name ?? "");
        return projectName.toLowerCase().includes(searchTerm.toLowerCase());
    });


    const filteredMembersOptions = membersOptions?.filter((option) => {
        const member = members.find((m) => m.userId._id === option.value);
        const memberName = member?.userId?.name || "";
        return memberName.toLowerCase().includes(searchMem.toLowerCase());
    });

    
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
                                        <label htmlFor="exampleInputName1">
                                            {t("taskboard-form-create-title")}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control bg-sidebar-input border-sidebar-border text-black dark:text-white rounded-lg"
                                            id="exampleInputName1"
                                            placeholder={t("taskboard-form-create-title-placeholder")}
                                            {...field}
                                        />
                                        <FormMessage className="text-red-500 text-sm" />
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


                        {/* {Project} */}
                        <div className="form-group">
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <label>{t("taskboard-form-create-project")}</label>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={cn(
                                                        "p-h",
                                                        !field.value ? "text-muted" : "text-black dark:text-white"
                                                    )}
                                                >
                                                    <SelectValue placeholder={t("taskboard-form-create-project-placeholder")} />
                                                </SelectTrigger>
                                            </FormControl>

                                            {/* lay du lieu project tu db de add vao task */}
                                            <SelectContent className="z-[9999]">
                                                {/* Search Input */}
                                                <ul className="navbar-nav w-100">
                                                    <li className="nav-item w-100">
                                                        <form className="nav-link mt-2 mt-md-0 d-none d-lg-flex search">
                                                            <div className="relative w-full">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                                    <Search className="w-4 h-4 text-muted" />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                    onKeyUp={(e) => e.stopPropagation()}
                                                                    className="form-control w-full pl-10 rounded-lg bg-sidebar border-sidebar-border text-black dark:text-white"
                                                                    placeholder={t("memberdashboard-search-placeholder")}
                                                                />
                                                            </div>
                                                        </form>
                                                    </li>
                                                </ul>

                                                {/*Filtered List or No Match */}
                                                <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                                                    {filteredOptions && filteredOptions.length > 0 ? (
                                                        filteredOptions.map((option) => (
                                                            <SelectItem
                                                                className="cursor-pointer"
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-sm text-muted">
                                                            {t("taskboard-create-task-no-member")}
                                                        </div>
                                                    )}
                                                </div>
                                            </SelectContent>

                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        {/*Members AssigneeTo*/}
                        <div className="form-group">
                            <FormField
                                control={form.control}
                                name="assignedTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <label>{t("taskboard-assignedto")}</label>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={cn(
                                                        "p-h",
                                                        !field.value ? "text-muted" : "text-black dark:text-white"
                                                    )}
                                                >
                                                    <SelectValue placeholder={t("taskboard-create-task-assignedto-placeholder")} />
                                                </SelectTrigger>
                                            </FormControl>

                                            {/* lay du lieu member tu db de add vao task */}
                                            <SelectContent className="z-[9999]">
                                                {/* Search Input */}
                                                <ul className="navbar-nav w-100">
                                                    <li className="nav-item w-100">
                                                        <form className="nav-link mt-2 mt-md-0 d-none d-lg-flex search">
                                                            <div className="relative w-full">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                                    <Search className="w-4 h-4 text-muted" />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={searchMem}
                                                                    onChange={(e) => setSearchMem(e.target.value)}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                    onKeyUp={(e) => e.stopPropagation()}
                                                                    className="form-control w-full pl-10 rounded-lg bg-sidebar border-sidebar-border text-black dark:text-white"
                                                                    placeholder={t("memberdashboard-search-placeholder")}
                                                                />
                                                            </div>
                                                        </form>
                                                    </li>
                                                </ul>

                                                {/*Filtered List or No Match */}
                                                <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                                                    {filteredMembersOptions && filteredMembersOptions.length > 0 ? (
                                                        filteredMembersOptions.map((option) => (
                                                            <SelectItem
                                                                className="cursor-pointer"
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-sm text-muted">
                                                            {t("taskboard-create-task-no-member")}
                                                        </div>
                                                    )}
                                                </div>
                                            </SelectContent>

                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        {/* {Due Date} */}
                        <div className="form-group">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <label>{t("taskboard-create-task-duedate")}</label>
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="datefield"
                                                        size="date"
                                                        className={cn(
                                                            "p-h w-full flex-1 text-left font-normal justify-between",
                                                            !field.value ? "text-muted" : "text-black dark:text-white"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, formatStr, { locale: dateLocale })
                                                        ) : (
                                                            <span className="text-muted">{t("taskboard-create-task-duedate-placeholder")}</span>
                                                        )}
                                                        <CalendarIcon
                                                            className={cn(
                                                                "h-4 w-4",
                                                                field.value ? "text-black dark:text-white" : "text-muted"
                                                            )}
                                                        />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        field.onChange(date)
                                                        setOpen(false)
                                                    }}
                                                    locale={getDateFnsLocale()}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                                        date > new Date("2100-12-31")
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
                        <div className="form-group">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <label>{t("dashboard-task-status")}</label>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={cn(
                                                        "p-h",
                                                        !field.value ? "text-muted" : "text-black dark:text-white"
                                                    )}
                                                >
                                                    <SelectValue placeholder={t("taskboard-create-task-status-placeholder")} />
                                                </SelectTrigger>
                                            </FormControl>

                                            {/* lay du lieu trang thai tu db de add vao task */}
                                            <SelectContent className="z-[9999]">
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
                        <div className="form-group">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <label>{t("dashboard-task-priority")}</label>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={cn(
                                                        "p-h",
                                                        !field.value ? "text-muted" : "text-black dark:text-white"
                                                    )}
                                                >
                                                    <SelectValue placeholder={t("taskboard-create-task-priority-placeholder")} />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent className="z-[9999]">
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


                        {/* nút cập nhật task */}
                        <button
                            disabled={isPending}
                            type="submit"
                            className="btn bg-sidebar-frameicon mr-2"
                        >
                            {isPending && <Loader />}
                            {t("projectboard-edit-updatebtn")}
                        </button>
                        <button
                            className="btn btn-dark" type="button"
                            onClick={onClose} >{t("sidebar-createworkspace-cancelbtn")}
                        </button>

                    </form>
                </Form>
            </div>
        </div>
    );
}