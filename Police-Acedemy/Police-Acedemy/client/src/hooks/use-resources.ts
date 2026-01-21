import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertAnnouncement, type InsertApplication } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === ANNOUNCEMENTS ===
export function useAnnouncements() {
  return useQuery({
    queryKey: [api.announcements.list.path],
    queryFn: async () => {
      const res = await fetch(api.announcements.list.path);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return await res.json();
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      const res = await fetch(api.announcements.create.path, {
        method: api.announcements.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      toast({ 
        title: "تم نشر الإعلان بنجاح",
        description: "تم إرسال تعميم جديد لجميع الموظفين"
      });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.announcements.delete.path, { id });
      const res = await fetch(url, {
        method: api.announcements.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete announcement");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      toast({ title: "تم حذف الإعلان بنجاح" });
    },
  });
}

// === APPLICATIONS ===
export function useCreateApplication() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertApplication) => {
      const res = await fetch(api.applications.create.path, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit application");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "تم إرسال التقديم بنجاح",
        description: "سيتم مراجعة طلبك من قبل الإدارة"
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في التقديم",
        description: error.message,
      });
    },
  });
}

export function useApplications() {
  return useQuery({
    queryKey: [api.applications.list.path],
    queryFn: async () => {
      const res = await fetch(api.applications.list.path);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return await res.json();
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' | 'pending' }) => {
      const url = buildUrl(api.applications.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.applications.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({ title: "تم تحديث حالة الطلب" });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.tasks.create.path, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({ 
        title: "تمت إضافة المهمة بنجاح",
        description: "تم تحديث قائمة المهام الأسبوعية للمستجدين"
      });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.applications.delete.path, { id });
      const res = await fetch(url, {
        method: api.applications.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete application");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({ title: "تم حذف الطلب بنجاح" });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, {
        method: api.tasks.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete task");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      toast({ title: "تم حذف المهمة بنجاح" });
    },
  });
}

// === SETTINGS ===
export function useSetting(key: string) {
  return useQuery({
    queryKey: [api.settings.get.path, key],
    queryFn: async () => {
      const url = buildUrl(api.settings.get.path, { key });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch setting");
      return await res.json();
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const url = buildUrl(api.settings.update.path, { key });
      const res = await fetch(url, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return await res.json();
    },
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path, key] });
      toast({ title: "تم تحديث الإعدادات" });
    },
  });
}

// === RANKS & RULES ===
export function useRanks() {
  return useQuery({
    queryKey: [api.ranks.list.path],
    queryFn: async () => {
      const res = await fetch(api.ranks.list.path);
      if (!res.ok) throw new Error("Failed to fetch ranks");
      return await res.json();
    },
  });
}

export function useRules() {
  return useQuery({
    queryKey: [api.rules.list.path],
    queryFn: async () => {
      const res = await fetch(api.rules.list.path);
      if (!res.ok) throw new Error("Failed to fetch rules");
      return await res.json();
    },
  });
}
