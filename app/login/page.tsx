"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions";

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        const result = await registerUser(
          formData.name,
          formData.email,
          formData.password
        );
        if (!result.success) {
          setError(result.error || "Registration failed");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            {isRegistering ? "Register" : "Login"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg 
                           text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                           focus:ring-emerald-500 focus:border-transparent"
                  required={isRegistering}
                  placeholder="Enter your name"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg 
                         text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                         focus:ring-emerald-500 focus:border-transparent"
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg 
                         text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                         focus:ring-emerald-500 focus:border-transparent"
                required
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold 
                       py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isRegistering ? "Register" : "Login"}
            </button>
          </form>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-6 text-sm text-emerald-400 hover:text-emerald-300 w-full text-center"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
