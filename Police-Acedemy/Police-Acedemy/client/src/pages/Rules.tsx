import { useRules } from "@/hooks/use-resources";
import { Book, Shield, Gavel, Radio, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Rules() {
  const { data: rules, isLoading } = useRules();

  if (isLoading) return <div className="text-center p-10">جاري التحميل...</div>;

  // Group rules by category
  const categories = rules?.reduce((acc: any, rule: any) => {
    const cat = rule.category || "عامة";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rule);
    return acc;
  }, {});

  const getIcon = (cat: string) => {
    if (cat.includes("إطلاق")) return <AlertCircle className="w-5 h-5" />;
    if (cat.includes("راديو")) return <Radio className="w-5 h-5" />;
    if (cat.includes("مجرمين")) return <Gavel className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Book className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">القوانين والأنظمة</h1>
          <p className="text-muted-foreground">ميثاق العمل والبروتوكولات العسكرية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {categories && Object.entries(categories).map(([category, items]: [string, any], i: number) => (
          <motion.section
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 border-r-4 border-primary pr-4">
              <div className="text-primary">{getIcon(category)}</div>
              <h2 className="text-xl font-bold text-white">{category}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((rule: any) => (
                <motion.div
                  key={rule.id}
                  whileHover={{ scale: 1.01 }}
                  className="glass-card p-4 rounded-xl border border-white/5 bg-white/5 flex gap-4 items-start group"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">
                    {rule.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
