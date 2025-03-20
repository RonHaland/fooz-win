"use server";

import { createUser } from "@/utils/auth";

export async function registerUser(name: string, email: string, password: string) {
  try {
    const user = await createUser(name, email, password);
    return { success: true, user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An error occurred during registration" };
  }
} 