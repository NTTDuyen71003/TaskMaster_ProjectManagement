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

export default function CreateWorkspaceForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

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
        <div className="card-body">
          <h4 className="card-title">Let's build a Workspace</h4>
          <Form {...form}>
            <form className="forms-sample" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="form-group">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <>
                      <label htmlFor="exampleInputName1">Workspace name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleInputName1"
                        placeholder="Hutech's Uni"
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
                        Workspace description (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleTextarea1"
                        rows={4}
                        placeholder="Our team organizes marketing projects and tasks here."
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
                Create workspace
              </button>
              <button className="btn btn-dark" type="button" onClick={onClose} >Cancel</button>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
