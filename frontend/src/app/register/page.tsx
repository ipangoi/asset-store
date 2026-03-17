// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import api from "@/services/api"; 

// export default function RegisterPage() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleRegister = async (e: React.SyntheticEvent) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       await api.post("/user/register", { 
//         name, 
//         email, 
//         password 
//       });
      
//       router.push("/login");
//     } catch (err: any) {
//       setError(
//         err.response?.data?.message || 
//         "Registration failed. Email might already be used."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Dekorasi Background */}
//       <div className="absolute top-10 right-20 h-32 w-32 rounded-full bg-green-300 opacity-40 blur-2xl"></div>
//       <div className="absolute bottom-20 left-20 h-40 w-40 rounded-full bg-orange-300 opacity-40 blur-2xl"></div>

//       <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-2xl shadow-blue-500/10 relative z-10">
//         <div className="text-center mb-8">
//           <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-slate-800 tracking-tight mb-2">
//             <div className="h-8 w-8 rounded-xl bg-blue-500 -rotate-12"></div>
//             ASSETSTORE
//           </Link>
//           <p className="text-slate-500 font-medium">Join the creator community!</p>
//         </div>

//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 font-bold text-sm text-center">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleRegister} className="space-y-4">
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
//             <input
//               type="text"
//               required
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all"
//               placeholder="John Doe"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all"
//               placeholder="you@example.com"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               minLength={6}
//               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all"
//               placeholder="••••••••"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full mt-6 rounded-full bg-orange-400 px-8 py-4 text-lg font-bold text-white border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 hover:bg-orange-300 transition-all shadow-lg shadow-orange-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? "Creating account..." : "Create Account"}
//           </button>
//         </form>

//         <p className="mt-8 text-center text-slate-500 font-medium text-sm">
//           Already have an account?{" "}
//           <Link href="/login" className="text-blue-500 font-bold hover:underline">
//             Log in here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api"; 
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/user/register", { 
        name, 
        email, 
        password 
      });
      
      router.push("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        "Registration failed. Email might already be used."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 right-20 h-32 w-32 rounded-full bg-emerald-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] hidden md:block"></div>
      <div className="absolute bottom-20 left-20 h-40 w-40 rounded-xl -rotate-12 bg-sky-400 border-4 border-black shadow-[6px_6px_0px_0px_#000] hidden md:block"></div>


      <div className="relative py-6 my-4 z-10 w-full max-w-md flex flex-col">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-400 px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-black uppercase text-sm w-fit"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3px]" />
          BACK TO HOME
        </Link>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000] relative z-10 mt-4 mb-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-3xl font-black text-black tracking-tighter mb-2">
              <div className="h-8 w-8 rounded-xl bg-pink-500 border-2 border-black -rotate-12 shadow-[2px_2px_0px_0px_#000]"></div>
              ASSETSTORE
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl text-white font-black text-sm text-center uppercase">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-4 border-black rounded-2xl px-4 py-3 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-gray-400"
                placeholder="John Doe"
              />
            </div>

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
                minLength={6}
                className="w-full bg-white border-4 border-black rounded-2xl px-4 py-3 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-full bg-amber-500 px-8 py-4 text-xl font-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "CREATING..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="mt-8 text-center text-black font-bold text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-500 font-black hover:underline decoration-4 underline-offset-4">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}