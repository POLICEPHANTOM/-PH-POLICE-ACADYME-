import { useState } from "react";
import { useUser } from "@/hooks/use-auth";
import { useCreateAnnouncement, useApplications, useUpdateApplicationStatus, useDeleteApplication, useSetting, useUpdateSetting } from "@/hooks/use-resources";
import { ShieldCheck, Megaphone, Users, Check, X, Lock, Unlock, Loader2, ChevronDown, ChevronUp, FileText, Trash2, UserPlus, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

export default function Admin() {
  const { data: user } = useUser();
  const { data: appSettings } = useSetting('applications_open');
  const { mutate: updateSettings } = useUpdateSetting();
  const { mutate: createAnnouncement, isPending: isPublishing } = useCreateAnnouncement();
  const { data: applications, isLoading: isLoadingApps } = useApplications();
  const { mutate: updateAppStatus } = useUpdateApplicationStatus();
  const { mutate: deleteApplication } = useDeleteApplication();
  const { toast } = useToast();
  
  const [announcementContent, setAnnouncementContent] = useState("");
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  
  // Role management state
  const [targetUsername, setTargetUsername] = useState("");
  const [targetRole, setTargetRole] = useState("citizen");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === 'admin'
  });

  const getRoleLabel = (role?: string) => {
    if (role === 'admin') return "مسؤول";
    if (role === 'police') return "عسكري";
    if (role === 'recruit') return "مستجد";
    if (role === 'ftp') return "FTP";
    if (role === 'fto') return "FTO";
    return "مواطن";
  };

  if (user?.role !== 'admin' && user?.role !== 'ftp' && user?.role !== 'fto') {
    return <div className="p-10 text-center text-red-500 font-bold text-2xl">غير مصرح لك بالدخول لهذه الصفحة</div>;
  }

  const isAppsOpen = appSettings?.value === true;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    createAnnouncement({ content: announcementContent }, {
      onSuccess: () => setAnnouncementContent("")
    });
  };

  const toggleApps = () => {
    updateSettings({ key: 'applications_open', value: !isAppsOpen });
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;
    
    setIsUpdatingRole(true);
    try {
      await apiRequest("POST", "/api/admin/update-role", { username: targetUsername, role: targetRole });
      toast({ title: "تم تحديث الرتبة بنجاح" });
      setTargetUsername("");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في التحديث",
        description: error.message 
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">إدارة النظام والطلبات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users List Section */}
        {user?.role === 'admin' && (
          <section className="glass-card p-6 rounded-2xl lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">قائمة المستخدمين المسجلين</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right" dir="rtl">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-sm">
                    <th className="pb-4 pr-4">اسم المستخدم</th>
                    <th className="pb-4 px-4">ديسكورد</th>
                    <th className="pb-4 px-4">الرتبة</th>
                    <th className="pb-4 pl-4">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoadingUsers ? (
                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">جاري تحميل المستخدمين...</td></tr>
                  ) : Array.isArray(allUsers) && allUsers.map((u: any) => (
                    <tr key={u.id} className="text-white hover:bg-white/5 transition-colors">
                      <td className="py-4 pr-4 font-medium">{u.username}</td>
                      <td className="py-4 px-4 text-muted-foreground">{u.discord || "غير متوفر"}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-sm text-muted-foreground">
                        {u.createdAt ? format(new Date(u.createdAt), "yyyy/MM/dd", { locale: ar }) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Post Announcement */}
        {(user?.role === 'admin' || user?.role === 'ftp' || user?.role === 'fto') && (
          <section className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-white">نشر تعميم جديد</h2>
            </div>
            <form onSubmit={handlePublish} className="space-y-4">
              <textarea
                required
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                className="w-full h-40 p-4 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white resize-none"
                placeholder="اكتب نص الإعلان هنا..."
              />
              <button
                type="submit"
                disabled={isPublishing || !announcementContent.trim()}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "نشر الإعلان"}
              </button>
            </form>
          </section>
        )}

        {/* System Settings */}
        {(user?.role === 'admin' || user?.role === 'ftp' || user?.role === 'fto') && (
          <section className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">إعدادات النظام</h2>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <h3 className="font-bold text-white">حالة التقديم</h3>
                <p className="text-sm text-muted-foreground">
                  {isAppsOpen ? "التقديم مفتوح حالياً" : "التقديم مغلق حالياً"}
                </p>
              </div>
              
              <button 
                onClick={toggleApps} 
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${ 
                  isAppsOpen ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
                }`}
              >
                {isAppsOpen ? <><Lock className="w-4 h-4" /> إغلاق</> : <><Unlock className="w-4 h-4" /> فتح</>}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">إسناد رتبة لحساب</h3>
              </div>
              <form onSubmit={handleUpdateRole} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    required
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    className="flex-1 p-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white text-right"
                    placeholder="اسم المستخدم"
                  />
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="p-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white text-right md:w-40"
                    dir="rtl"
                  >
                    <option value="citizen">مواطن</option>
                    <option value="recruit">مستجد</option>
                    <option value="police">عسكري</option>
                    <option value="ftp">FTP</option>
                    <option value="fto">FTO</option>
                    <option value="admin">مسؤول</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isUpdatingRole || !targetUsername.trim()}
                    className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isUpdatingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : "تحديث"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    
      {/* Applications List */}
      <div className="grid grid-cols-1 gap-8">
        {(user?.role === 'admin' || user?.role === 'fto') && (
          <section className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">طلبات تقديم الأكاديمية</h2>
            </div>

            <div className="space-y-4">
              {isLoadingApps ? (
                <div className="text-center py-10">جاري التحميل...</div>
              ) : applications?.filter((a: any) => a.type === 'academy').length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">لا توجد طلبات أكاديمية جديدة</div>
              ) : (
                applications?.filter((a: any) => a.type === 'academy').map((app: any) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-3 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {app.status === 'pending' ? 'قيد الانتظار' : app.status === 'approved' ? 'مقبول' : 'مرفوض'}
                          </span>
                          <span className="font-bold text-lg text-white">{app.user.username} ({getRoleLabel(app.user.role)}) {app.user.discord && <span className="text-sm font-normal text-muted-foreground ml-2">({app.user.discord})</span>}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(app.createdAt!), "PPpp", { locale: ar })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm text-white"
                        >
                          {expandedApp === app.id ? <><ChevronUp className="w-4 h-4" /> إخفاء التفاصيل</> : <><ChevronDown className="w-4 h-4" /> عرض البيانات</>}
                        </button>
                        
                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2 ml-2 border-r border-white/10 pr-2">
                            <button
                              onClick={() => updateAppStatus({ id: app.id, status: 'approved' })}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="قبول"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateAppStatus({ id: app.id, status: 'rejected' })}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                              title="رفض"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
                              deleteApplication(app.id);
                            }
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedApp === app.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 border-t border-white/10 pt-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="rtl">
                            <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-right">
                              <p className="text-xs text-muted-foreground mb-1">اسم الشخصية</p>
                              <p className="text-sm text-white font-medium">{app.charName}</p>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-right">
                              <p className="text-xs text-muted-foreground mb-1">ديسكورد</p>
                              <p className="text-sm text-white font-medium">{app.discord}</p>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-right md:col-span-2">
                              <p className="text-xs text-muted-foreground mb-1">الخبرات</p>
                              <p className="text-sm text-white font-medium">{app.experience}</p>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-right md:col-span-2">
                              <p className="text-xs text-muted-foreground mb-1">هل سبق الانضمام لأكاديمية؟</p>
                              <p className="text-sm text-white font-medium">{app.joinedBefore}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {(user?.role === 'admin' || user?.role === 'ftp' || user?.role === 'fto') && (
          <section className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">طلبات تقديم الشرطة</h2>
            </div>

            <div className="space-y-4">
              {isLoadingApps ? (
                <div className="text-center py-10">جاري التحميل...</div>
              ) : applications?.filter((a: any) => a.type === 'police').length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">لا توجد طلبات شرطة جديدة</div>
              ) : (
                applications?.filter((a: any) => a.type === 'police').map((app: any) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4 overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-3 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {app.status === 'pending' ? 'قيد الانتظار' : app.status === 'approved' ? 'مقبول' : 'مرفوض'}
                          </span>
                          <span className="font-bold text-lg text-white">{app.user.username} ({getRoleLabel(app.user.role)}) {app.user.discord && <span className="text-sm font-normal text-muted-foreground ml-2">({app.user.discord})</span>}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(app.createdAt!), "PPpp", { locale: ar })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm text-white"
                        >
                          {expandedApp === app.id ? <><ChevronUp className="w-4 h-4" /> إخفاء التفاصيل</> : <><ChevronDown className="w-4 h-4" /> عرض الأجوبة</>}
                        </button>
                        
                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2 ml-2 border-r border-white/10 pr-2">
                            <button
                              onClick={() => updateAppStatus({ id: app.id, status: 'approved' })}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="قبول"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateAppStatus({ id: app.id, status: 'rejected' })}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                              title="رفض"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
                              deleteApplication(app.id);
                            }
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedApp === app.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 border-t border-white/10 pt-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="rtl">
                            {app.answers && Object.entries(app.answers).map(([question, answer]: [string, any], idx) => (
                              <div key={idx} className="p-3 bg-black/20 rounded-lg border border-white/5 text-right">
                                <p className="text-xs text-muted-foreground mb-1">{question}</p>
                                <p className="text-sm text-white font-medium">{answer}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
