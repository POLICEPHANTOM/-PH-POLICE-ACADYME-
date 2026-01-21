import { useState } from "react";
import { useUser } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ClipboardList, Plus, Trash2, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Task } from "@shared/schema";

export default function WeeklyTasks() {
  const { data: user } = useUser();
  const { toast } = useToast();
  const [content, setContent] = useState("");

  const { data: tasks, isLoading } = useQuery<(Task & { user: { username: string } })[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/tasks", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setContent("");
      toast({ 
        title: "تمت إضافة المهمة بنجاح",
        description: "تم تحديث قائمة المهام الأسبوعية للمستجدين"
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "تم حذف المهمة بنجاح" });
    },
  });

  const isAdmin = user?.role === 'admin';
  const canSee = isAdmin || user?.role === 'recruit' || user?.role === 'police';

  if (!canSee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">غير مصرح بالدخول</h2>
        <p className="text-muted-foreground">هذه الصفحة مخصصة للمستجدين والمسؤولين فقط.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">المهام الأسبوعية</h1>
          <p className="text-muted-foreground">جدول المهام والتكاليف للمستجدين</p>
        </div>
      </div>

      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            إضافة مهمة جديدة
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تفاصيل المهمة هنا..."
              className="flex-1 p-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white text-right"
            />
            <button
              onClick={() => createTaskMutation.mutate(content)}
              disabled={createTaskMutation.isPending || !content.trim()}
              className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createTaskMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "إضافة"}
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <p className="text-muted-foreground">لا توجد مهام مدرجة حالياً</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks?.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-5 rounded-xl border border-white/10 flex items-center justify-between group"
              >
                <div className="flex-1 text-right">
                  <p className="text-white text-lg mb-2">{task.content}</p>
                  <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
                    <span>بواسطة: {task.user.username}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{format(new Date(task.createdAt!), "PPpp", { locale: ar })}</span>
                  </div>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 mr-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
