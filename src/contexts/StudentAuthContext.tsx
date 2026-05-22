"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { studentAuth, getStudentToken, setStudentToken, clearStudentToken } from "@/lib/api";
import type { StudentUser } from "@/types/admin";

interface StudentAuthState {
  student: StudentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthState | null>(null);

export function useStudentAuth(): StudentAuthState {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be used within StudentAuthProvider");
  return ctx;
}

const STUDENT_KEY = "student_user";

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STUDENT_KEY);
    if (raw) {
      try {
        setStudent(JSON.parse(raw) as StudentUser);
      } catch {
        localStorage.removeItem(STUDENT_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await studentAuth.login(email, password);
      setStudentToken(res.access_token);
      localStorage.setItem(STUDENT_KEY, JSON.stringify(res.student));
      setStudent(res.student);
      return { ok: true };
    } catch (err: unknown) {
      return { ok: false, error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const logout = () => {
    clearStudentToken();
    localStorage.removeItem(STUDENT_KEY);
    setStudent(null);
    window.location.href = "/login";
  };

  return (
    <StudentAuthContext.Provider
      value={{ student, isAuthenticated: !!student && !!getStudentToken(), loading, login, logout }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}
