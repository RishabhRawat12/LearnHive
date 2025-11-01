import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, AlertCircle } from "lucide-react";
import { toast } from "sonner"; // Use sonner toast

// --- NEW IMPORTS ---
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
// --- END NEW IMPORTS ---

// Schemas remain the same
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
// ... signupSchema ...
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    isTutor: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

// API call functions
const loginUser = async (data: LoginFormData) => {
  const response = await api.post("/auth/login", data);
  return response.data; // { token: "..." }
};

const signupUser = async (data: SignupFormData) => {
  const response = await api.post("/auth/register", data);
  return response.data; // { token: "..." }
};

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  const mode = searchParams.get("mode") || "login";
  const isTutorSignup = searchParams.get("tutor") === "true";

  const [isLogin, setIsLogin] = useState(mode === "login");
  const [isTutor, setIsTutor] = useState(isTutorSignup);

  // Forms remain the same
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isTutor: isTutorSignup,
    },
  });

  // --- NEW API MUTATIONS ---
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data.token); // Save token to context/localStorage
      toast.success("Welcome back!");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (data, variables) => {
      login(data.token);
      const accountType = variables.isTutor ? "tutor" : "student";
      toast.success(`Account created successfully as a ${accountType}!`);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Signup failed");
    },
  });
  // --- END NEW API MUTATIONS ---

  // Update submit handlers
  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onSignupSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };
  
  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    signupForm.reset();
  };
  
  // Get loading states
  const isLoggingIn = loginMutation.isPending;
  const isSigningUp = signupMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Sign in to your LearnHive account"
              : "Join LearnHive and start learning"}
          </p>
        </div>

        {isLogin ? (
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-4"
          >
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...loginForm.register("email")}
                disabled={isLoggingIn}
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...loginForm.register("password")}
                disabled={isLoggingIn}
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={signupForm.handleSubmit(onSignupSubmit)}
            className="space-y-4"
          >
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                {...signupForm.register("name")}
                disabled={isSigningUp}
              />
              {signupForm.formState.errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {signupForm.formState.errors.name.message}
                </p>
              )}
            </div>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email Address</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                {...signupForm.register("email")}
                disabled={isSigningUp}
              />
              {signupForm.formState.errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>
            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Enter your password"
                {...signupForm.register("password")}
                disabled={isSigningUp}
              />
              {signupForm.formState.errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {signupForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...signupForm.register("confirmPassword")}
                disabled={isSigningUp}
              />
              {signupForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {signupForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            {/* Tutor Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTutor"
                checked={isTutor}
                onCheckedChange={(checked) => {
                  setIsTutor(checked as boolean);
                  signupForm.setValue("isTutor", checked as boolean);
                }}
                disabled={isSigningUp}
              />
              <Label htmlFor="isTutor" className="cursor-pointer font-normal">
                I want to be a Tutor
              </Label>
            </div>
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSigningUp}>
              {isSigningUp ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary hover:underline"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;