import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="glass-card p-10 rounded-2xl text-center max-w-md w-full">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">الصفحة غير موجودة</p>
        <Link href="/">
          <a className="inline-block w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
            العودة للرئيسية
          </a>
        </Link>
      </div>
    </div>
  );
}
