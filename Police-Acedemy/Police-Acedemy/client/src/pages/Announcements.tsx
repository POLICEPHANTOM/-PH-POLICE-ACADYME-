import { useAnnouncements, useDeleteAnnouncement } from "@/hooks/use-resources";
import { useUser } from "@/hooks/use-auth";
import { Megaphone, Calendar, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Announcements() {
  const { data: user } = useUser();
  const { data: announcements, isLoading } = useAnnouncements();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  if (isLoading) {
    return <div className="text-center p-10 text-muted-foreground">جاري تحميل الإعلانات...</div>;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">الإعلانات والتعاميم</h1>
          <p className="text-muted-foreground">آخر المستجدات والأخبار الرسمية</p>
        </div>
      </div>

      <div className="space-y-6">
        {announcements?.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد إعلانات</h3>
            <p className="text-muted-foreground">لم يتم نشر أي تعاميم أو إعلانات حتى الآن</p>
          </div>
        ) : (
          announcements?.map((announcement: any, idx: number) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-2xl border-r-4 border-r-primary flex flex-col md:flex-row gap-6 relative group"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(announcement.createdAt!), "PPpp", { locale: ar })}</span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
                          deleteAnnouncement(announcement.id);
                        }
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="حذف الإعلان"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-white whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
