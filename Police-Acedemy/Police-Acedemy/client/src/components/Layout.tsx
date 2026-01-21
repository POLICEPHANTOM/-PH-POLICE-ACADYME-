import { Sidebar } from "./Sidebar";
import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Routes that don't need sidebar/auth layout
  const publicRoutes = ["/login", "/register"];
  if (!user && publicRoutes.includes(location)) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Protected Routes Check
  if (!user && !publicRoutes.includes(location)) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <Sidebar />
      <main className="flex-1 mr-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
