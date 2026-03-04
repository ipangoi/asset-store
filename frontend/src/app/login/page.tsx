"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import api from "@/services/api";
import { ArrowLeft } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/user/login", { email, password });
      
      const { token } = response.data;

      Cookies.set("token", token, { expires: 1 });

      router.replace(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 h-32 w-32 rounded-full bg-amber-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] hidden md:block"></div>
      <div className="absolute bottom-20 right-20 h-40 w-40 rounded-xl rotate-12 bg-pink-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] hidden md:block"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 bg-amber-400 px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-black uppercase text-sm w-fit"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3px]" />
          BACK TO HOME
        </Link>

        <div className="w-full bg-white rounded-3xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-3xl font-black text-black tracking-tighter mb-2">
              <div className="h-8 w-8 rounded-xl bg-pink-400 border-2 border-black rotate-12 shadow-[2px_2px_0px_0px_#000]"></div>
              ASSETSTORE
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl text-white font-black text-sm text-center uppercase">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-4 border-black rounded-2xl px-4 py-3 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-4 border-black rounded-2xl px-4 py-3 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 rounded-full bg-sky-500 px-8 py-4 text-xl font-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "LOGGING IN..." : "LOGIN TO ACCOUNT"}
            </button>
          </form>

          <p className="mt-8 text-center text-black font-bold text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-amber-500 font-black hover:underline decoration-4 underline-offset-4">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}