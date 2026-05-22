"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BetterMeRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/student/better-me"); }, [router]);
  return null;
}
