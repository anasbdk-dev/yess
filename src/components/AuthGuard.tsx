import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function AuthGuard({ children, allow }: { children: React.ReactNode; allow: string[] }) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // ← هذا هو المهم، انتظر حتى تكتمل الـ loading
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (allow.length > 0 && role && !allow.includes(role)) {
      navigate({ to: "/login" });
    }
  }, [loading, user, role]);

  // لا تعرض شيء أثناء loading
  if (loading) return null;
  
  // لا تعرض شيء إذا لم يكن مسموحاً
  if (!user || (allow.length > 0 && role && !allow.includes(role))) return null;

  return <>{children}</>;
}