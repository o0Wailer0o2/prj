"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createLoginMutationOptions } from "@/lib/tanstack/options/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(5, "Password must be at least 5 characters")
});

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema)
  });
  const navigate = useNavigate();
  const set = useAuthStore().set;

  const loginMutation = useMutation({
    ...createLoginMutationOptions(),
    onSuccess: (data) => {
      set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.userId
      });
      navigate({ to: "/" });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      toast.error("Login failed");
    }
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    await loginMutation.mutateAsync(values);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <Field>
          <a href="#" className="ml-auto text-center text-sm underline-offset-4 hover:underline">
            Forgot your password?
          </a>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
