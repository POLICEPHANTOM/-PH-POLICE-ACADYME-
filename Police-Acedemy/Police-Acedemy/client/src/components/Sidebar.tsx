import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  Megaphone, 
  ListOrdered, 
  LogOut, 
  Gavel,
  ShieldCheck,
  GraduationCap,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

import academyLogo from "@assets/LSPALogo_1768480759917.webp";

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();

  const links = [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/announcements", label: "الإعلانات", icon: Megaphone },
    { href: "/weekly-tasks", label: "المهام الأسبوعية", icon: Calendar },
    { href: "/ranks", label: "الرتب", icon: Shield },
    { href: "/rules", label: "القوانين", icon: Gavel },
    { href: "/academy-apply", label: "التقديم على الأكاديمية", icon: GraduationCap },
    { href: "/apply", label: "التقديم على الشرطة", icon: FileText },
  ];

  if (user?.role === "admin" || user?.role === "ftp" || user?.role === "fto") {
    links.push({ href: "/admin", label: "لوحة التحكم", icon: ShieldCheck });
  }

  return (
    <div className="h-screen w-64 bg-card border-l border-border fixed right-0 top-0 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center p-1 overflow-hidden">
          <img src={academyLogo} alt="LSPA Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white">وزارة الداخلية</h1>
          <p className="text-xs text-muted-foreground">بوابة الخدمات الإلكترونية</p>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary font-bold border border-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                <span>{link.label}</span>
                {isActive && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 p-3 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
