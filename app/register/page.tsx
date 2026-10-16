import React from "react";
import { notFound } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account · Spidy Analytics",
  description: "Register for privacy-first, cookieless web analytics.",
};

export default function RegisterPage() {
  if (process.env.ALLOW_REGISTRATION === "false") {
    notFound();
  }

  return <RegisterForm />;
}
