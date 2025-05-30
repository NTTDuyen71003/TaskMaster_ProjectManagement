import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FaEye, FaUserCircle } from "react-icons/fa";
import { IoIosEyeOff } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdAttachEmail } from "react-icons/md";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import GoogleOauthButton from "@/components/auth/google-oauth-button";
import { useMutation } from "@tanstack/react-query";
import { registerMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });
  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Name is required",
    }),
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Workspace name is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6">
      <div className="flex w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
        {/* Left Geometric Background */}
        <div className="hidden md:block w-1/3 bg-gradient-to-br from-pink-400 to-pink-300 relative">
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,0 100,0 0,100" fill="rgba(255,255,255,0.2)" />
              <polygon points="0,100 100,0 100,100" fill="rgba(255,255,255,0.1)" />
            </svg>
          </div>
        </div>

        {/* Right Sign-Up Form */}
        <div className="w-full md:w-2/3 bg-white p-8">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <span className="flex items-center gap-2">
              <div className="cursor-pointer">
                <img
                  src="/images/taskmaster_logo2.png"
                  alt="Logo"
                  className=""
                />
              </div>
            </span>
          </div>

          {/* Tabs (Login / Sign Up) */}
          <div className="flex justify-center gap-4 mb-6">
            <button className="text-lg font-semibold text-gray-500 pb-1">
              <Link to="/" className="">
                LOGIN
              </Link>
            </button>
            <button className="text-lg font-semibold text-sidebar-frameicon border-b-2 border-sidebar-frameicon pb-1">
              SIGN UP
            </button>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                          <FaUserCircle />
                        </span>
                        <FormControl>
                          <Input
                            placeholder="Name"
                            className="pl-10 h-12 rounded-lg border-gray-300 
                            focus:border-sidebar-frameicon focus:ring-sidebar-frameicon
                            text-black"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                          <MdAttachEmail />
                        </span>
                        <FormControl>
                          <Input
                            placeholder="Email"
                            className="pl-10 h-12 rounded-lg border-gray-300
                             focus:border-sidebar-frameicon focus:ring-sidebar-frameicon
                             text-black"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    const [showPassword, setShowPassword] = useState(false);
                    return (
                      <FormItem>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                            <RiLockPasswordFill />
                          </span>
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              className="pl-10 pr-10 h-12 rounded-lg border-gray-300 
                              focus:border-sidebar-frameicon focus:ring-sidebar-frameicon
                              text-black"
                              {...field}
                            />
                          </FormControl>
                          <span
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <FaEye size={20} /> : <IoIosEyeOff size={20} />}
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Sign Up Button */}
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12 rounded-lg"
                >
                  {isPending && <Loader className="animate-spin mr-2" />}
                  SIGN UP
                </Button>
              </div>

              {/* Social Login */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Or Sign up with</p>
                <div className="flex justify-center gap-4">
                  <GoogleOauthButton/>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/" className="text-pink-500 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
