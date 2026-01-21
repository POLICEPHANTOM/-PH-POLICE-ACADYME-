import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, type InsertApplication } from "@shared/schema";
import { useCreateApplication, useSetting } from "@/hooks/use-resources";
import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Send, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AcademyApply() {
  const [, setLocation] = useLocation();
  const { data: user } = useUser();
  const { data: appSettings, isLoading: isLoadingSettings } = useSetting('applications_open');
  const { mutate: submitApp, isPending } = useCreateApplication();

  const form = useForm<InsertApplication>({
    resolver: zodResolver(insertApplicationSchema),
    defaultValues: {
      charName: "",
      discord: "",
      experience: "",
      joinedBefore: "",
    },
  });

  const onSubmit = (data: InsertApplication) => {
    submitApp({ ...data, type: 'academy' }, {
      onSuccess: () => setLocation("/"),
    });
  };

  if (isLoadingSettings) return <div className="text-center p-10">جاري التحميل...</div>;

  const isAdminOrPolice = user?.role === 'admin' || user?.role === 'police';

  if (!isAdminOrPolice) {
    return <div className="p-10 text-center text-red-500 font-bold text-2xl">هذه الصفحة مخصصة للعسكريين فقط</div>;
  }

  const isAppsOpen = appSettings?.value === true;

  if (!isAppsOpen) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white">التقديم مغلق حالياً</h1>
        <p className="text-muted-foreground max-w-md">نعتذر، التقديم على الأكاديمية مغلق في الوقت الحالي. يرجى متابعة الإعلانات لمعرفة موعد الفتح القادم.</p>
        <Button onClick={() => setLocation("/")} variant="outline" className="mt-4">
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">التقديم على الأكاديمية</h1>
          <p className="text-muted-foreground">يرجى تعبئة البيانات المطلوبة بدقة</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">نموذج الانضمام</CardTitle>
            <CardDescription>هذا النموذج مخصص للراغبين في الانضمام لأكاديمية الشرطة</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="charName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">اسم الشخصية</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="bg-white/5 border-white/10 text-white" placeholder="أدخل اسم الشخصية الثلاثي" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discord"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">ديسكوردك</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="bg-white/5 border-white/10 text-white" placeholder="Username#0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">خبراتك</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          className="bg-white/5 border-white/10 text-white min-h-[100px]" 
                          placeholder="اذكر خبراتك السابقة في رول بلاي الشرطة أو مجالات مشابهة" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joinedBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">هل قد دخلت اكادمية ؟</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="bg-white/5 border-white/10 text-white" placeholder="نعم/لا (إذا نعم، اذكر أين ومتى)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> إرسال الطلب</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
