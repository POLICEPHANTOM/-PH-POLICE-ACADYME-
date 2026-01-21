import { useRanks } from "@/hooks/use-resources";
import { Shield, User, Hash } from "lucide-react";
import { motion } from "framer-motion";

export default function Ranks() {
  const { data: ranks, isLoading } = useRanks();

  if (isLoading) return <div className="text-center p-10">جاري التحميل...</div>;

  const sortedRanks = ranks?.sort((a: any, b: any) => a.order - b.order) || [];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">الهيكل التنظيمي والرتب</h1>
          <p className="text-muted-foreground">قائمة الرتب المعتمدة في النظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedRanks.map((rank: any, i: number) => (
          <motion.div
            key={rank.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-primary font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">الرتبة</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{rank.title}</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 md:gap-12">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">الاسم</span>
                  </div>
                  <p className="text-xl font-bold text-white/90">{rank.name}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">الكود</span>
                  </div>
                  <div className="px-4 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="text-xl font-mono font-bold text-primary">{rank.code}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
