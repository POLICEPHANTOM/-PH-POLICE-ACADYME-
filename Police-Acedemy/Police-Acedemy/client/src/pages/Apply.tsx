import { useState, useEffect } from "react";
import { useCreateApplication, useSetting } from "@/hooks/use-resources";
import { FileText, CheckCircle2, AlertTriangle, Loader2, Timer, ArrowLeft, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-auth";

const QUESTIONS = [
  { id: "p1", type: "protocol", label: "0-1", timer: 7 },
  { id: "p2", type: "protocol", label: "0-2", timer: 7 },
  { id: "p3", type: "protocol", label: "0-3", timer: 7 },
  { id: "p4", type: "protocol", label: "0-4", timer: 7 },
  { id: "p5", type: "protocol", label: "0-5", timer: 7 },
  { id: "p6", type: "protocol", label: "0-6", timer: 7 },
  { id: "p7", type: "protocol", label: "0-7", timer: 7 },
  { id: "p8", type: "protocol", label: "0-8", timer: 7 },
  { id: "p9", type: "protocol", label: "10-1", timer: 7 },
  { id: "p10", type: "protocol", label: "10-3", timer: 7 },
  { id: "p11", type: "protocol", label: "10-7", timer: 7 },
  { id: "p12", type: "protocol", label: "10-6", timer: 7 },
  { id: "q1", type: "general", label: "اذكر 4 من شروط الهروب امن", timer: 15 },
  { id: "q2", type: "general", label: "كم مدة بين كل بلاغ وبلاغ", timer: 5 },
  { id: "q3", type: "general", label: "وش تصنيف بلاغات بنك وكم وحدة تتوجه لكل بلاغ", timer: 25 },
];

export default function Apply() {
  const { data: user } = useUser();
  const { data: appSettings, isLoading: isLoadingSettings } = useSetting('applications_open');
  const { mutate: submitApplication, isPending } = useCreateApplication();
  
  const [step, setStep] = useState<'intro' | 'test' | 'success'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");

  if (user?.role === 'police' || user?.role === 'recruit' || user?.role === 'ftp' || user?.role === 'fto') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-6">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">أنت عضو بالفعل</h2>
        <p className="text-muted-foreground max-w-md">لا يمكنك التقديم على الشرطة لأنك تمتلك رتبة عسكرية بالفعل في النظام.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'test' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 'test' && timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const startTest = () => {
    setStep('test');
    setCurrentQuestionIndex(0);
    setTimeLeft(QUESTIONS[0].timer);
  };

  const handleNextQuestion = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const updatedAnswers = { ...answers, [question.label]: currentAnswer };
    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(QUESTIONS[currentQuestionIndex + 1].timer);
    } else {
      setStep('success');
      submitApplication({ 
        type: 'police',
        protocols: QUESTIONS.map(q => q.label),
        answers: updatedAnswers
      });
    }
  };

  if (isLoadingSettings) return <div className="text-center p-10">جاري التحقق من حالة التقديم...</div>;

  const isOpen = appSettings?.value === true;

  if (!isOpen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">التقديم مغلق حالياً</h2>
        <p className="text-muted-foreground max-w-md">نعتذر، باب التقديم مغلق في الوقت الحالي. يرجى متابعة الإعلانات لمعرفة موعد الفتح القادم.</p>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4" dir="rtl">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">التقديم على الشرطة</h1>
            <p className="text-muted-foreground text-lg mb-8">سيتم اختبارك في البروتوكولات والأسئلة العامة. التوقيت يختلف حسب السؤال.</p>
            
            <div className="glass-card rounded-2xl p-8 border border-primary/20 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-yellow-500 mb-6 justify-center">
                <Timer className="w-6 h-6" />
                <span className="font-bold">الاختبار يشمل {QUESTIONS.length} سؤال</span>
              </div>
              <button
                onClick={startTest}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                بدء الاختبار الآن
              </button>
            </div>
          </motion.div>
        )}

        {step === 'test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold">
                  {currentQuestionIndex + 1}/{QUESTIONS.length}
                </div>
                <h2 className="text-2xl font-bold text-white">التقديم على الشرطة</h2>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono font-bold",
                timeLeft <= 5 ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse" : "bg-white/5 border-white/10 text-white"
              )}>
                <Timer className="w-5 h-5" />
                {timeLeft}s
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-primary/20">
              <div className="text-center mb-8">
                <p className="text-muted-foreground mb-2">
                  {currentQuestion.type === 'protocol' ? 'عرف البروتوكول التالي:' : 'أجب على السؤال التالي:'}
                </p>
                <h3 className={cn(
                  "font-black text-primary",
                  currentQuestion.type === 'protocol' ? "text-5xl font-mono" : "text-3xl leading-relaxed"
                )}>
                  {currentQuestion.label}
                </h3>
              </div>

              <textarea
                autoFocus
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="w-full h-40 p-6 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-primary/50 text-white text-xl resize-none text-right"
                placeholder="اكتب إجابتك هنا بسرعة..."
                dir="rtl"
              />

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2"
                >
                  {currentQuestionIndex === QUESTIONS.length - 1 ? "إنهاء وإرسال" : "السؤال التالي"}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8"
          >
            {isPending ? (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-white">جاري إرسال إجاباتك...</h2>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">تم الإرسال بنجاح</h2>
                <p className="text-muted-foreground text-lg mb-8">لقد أكملت الاختبار بنجاح. سيتم مراجعة إجاباتك من قبل الإدارة والرد عليك قريباً.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  العودة للرئيسية
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
