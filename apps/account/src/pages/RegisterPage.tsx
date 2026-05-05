import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";
import { registerSchema, type RegisterInput } from "@mfe/shared";
import { useRegister, type AxiosError } from "@mfe/api";
import { useStore } from "@mfe/store";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@mfe/ui";

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const { mutate: register_, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    register_(data, {
      onSuccess: (res) => {
        setAuth(res.user);
        navigate("/");
      },
    });
  };

  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {(error as AxiosError<{ error: string }>)?.response?.data
                    ?.error ?? "Something went wrong. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account…" : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="../login"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
