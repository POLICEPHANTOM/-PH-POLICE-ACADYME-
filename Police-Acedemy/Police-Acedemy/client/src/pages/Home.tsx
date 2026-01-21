import { useUser } from "@/hooks/use-auth";
import { Shield, FileText, Megaphone, Bell, ArrowLeft, Clock, BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useApplications } from "@/hooks/use-resources";

export default function Home() {
  const { data: user } = useUser();
  const { data: applications } = useApplications();

  // Find the most recent application for this user
  const userApplications = applications?.filter((app: any) => app.userId === user?.id) || [];
  const latestApp = userApplications.length > 0 ? userApplications[0] : null;

  const getRoleLabel = (role?: string) => {
    if (role === 'admin') return "مسؤول";
    if (role === 'police') return "عسكري";
    if (role === 'recruit') return "مستجد";
    if (role === 'ftp') return "FTP";
    if (role === 'fto') return "FTO";
    return "مواطن";
  };

  const stats = [
    { label: "حالة السيرفر", value: "متصل", color: "text-green-500", bg: "bg-green-500/10" },
    { label: "رتبتك الحالية", value: getRoleLabel(user?.role), color: "text-primary", bg: "bg-primary/10" },
    { label: "آخر ظهور", value: "الآن", color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم الرئيسية</h1>
          <p className="text-muted-foreground">أهلاً بك مجدداً، {user?.username}</p>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-primary" />
        </div>
      </div>

      {latestApp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border flex items-center justify-between ${
            latestApp.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
            latestApp.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              latestApp.status === 'approved' ? 'bg-green-500/20' :
              latestApp.status === 'rejected' ? 'bg-red-500/20' :
              'bg-yellow-500/20'
            }`}>
              {latestApp.status === 'approved' ? <CheckCircle className="w-6 h-6" /> :
               latestApp.status === 'rejected' ? <XCircle className="w-6 h-6" /> :
               <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-lg">
                حالة تقديمك على {latestApp.type === 'police' ? 'الشرطة' : 'الأكاديمية'}
              </h4>
              <p className="opacity-80">
                {latestApp.status === 'approved' ? 'تم قبول طلبك بنجاح! ننتظرك في الميدان.' :
                 latestApp.status === 'rejected' ? 'للأسف تم رفض طلبك. يمكنك المحاولة مرة أخرى لاحقاً.' :
                 'طلبك لا يزال قيد المراجعة من قبل الإدارة.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <p className="text-muted-foreground text-sm font-medium mb-2">{stat.label}</p>
            <div className={`text-2xl font-bold ${stat.color} flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-br-full -translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">الإعلانات والتعاميم</h3>
            <p className="text-muted-foreground mb-6">اطلع على آخر الأخبار والقرارات الإدارية والتعاميم الصادرة.</p>
            <Link href="/announcements" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold hover:gap-3 transition-all">
              عرض الإعلانات <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-br-full -translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">التقديم للوظائف</h3>
            <p className="text-muted-foreground mb-6">قدم طلب الانضمام إلى الكادر الإداري أو العسكري عبر البوابة.</p>
            <Link href="/apply" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold hover:gap-3 transition-all">
              تقديم طلب جديد <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-8 relative overflow-hidden group border border-purple-500/20"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-br-full -translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">كتيب الأكاديمية</h3>
            <p className="text-muted-foreground mb-6">دليلك الكامل لجميع قوانين وبروتوكولات الأكاديمية والشرطة.</p>
            <a 
              href="https://policeacadyme.my.canva.site/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold hover:gap-3 transition-all"
            >
              فتح الكتيب <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
      
      <div className="bg-gradient-to-l from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-bold text-white">ساعات العمل الرسمية</h4>
                <p className="text-sm text-muted-foreground">النظام يعمل على مدار 24 ساعة لخدمتكم</p>
            </div>
        </div>
        <div className="text-2xl font-mono text-primary font-bold">
            24/7
        </div>
      </div>
    </div>
  );
}
