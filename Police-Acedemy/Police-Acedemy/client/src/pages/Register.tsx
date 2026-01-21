import { useState } from "react";
import { useRegister } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import academyLogo from "@assets/LSPALogo_1768480759917.webp";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [discord, setDiscord] = useState("");
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ username, password, discord });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.05),transparent_40%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 p-2 border border-primary/20 shadow-lg shadow-primary/10 overflow-hidden"
          >
            <img src={academyLogo} alt="LSPA Logo" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground">انضم إلى الطاقم الإداري</p>
        </div>

        <div className="glass-card rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">اسم المستخدم</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-gray-600"
                placeholder="اختر اسم مستخدم..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-gray-600"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">اسم مستخدم ديسكورد</label>
              <input
                type="text"
                required
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-white placeholder:text-gray-600"
                placeholder="example#0000"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التسجيل...
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline">
              سجل دخول
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
