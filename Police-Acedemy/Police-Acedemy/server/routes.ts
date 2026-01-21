import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertAnnouncementSchema, 
  insertApplicationSchema,
  insertTaskSchema,
  users as usersTable, 
  ranks as ranksTable, 
  rules as rulesTable,
  tasks as tasksTable
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // === AUTH Routes handled in setupAuth (/api/login, /api/logout, /api/user) ===

  app.post("/api/register", async (req, res) => {
    try {
      const input = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(input);
      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // === ANNOUNCEMENTS ===
  app.get(api.announcements.list.path, async (req, res) => {
    const list = await storage.getAnnouncements();
    res.json(list);
  });

  app.post(api.announcements.create.path, async (req, res) => {
    if (!req.isAuthenticated() || ((req.user as any).role !== 'admin' && (req.user as any).role !== 'ftp' && (req.user as any).role !== 'fto')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const input = insertAnnouncementSchema.parse(req.body);
    const item = await storage.createAnnouncement({ ...input, createdBy: (req.user as any).id });
    res.status(201).json(item);
  });

  app.delete(api.announcements.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || ((req.user as any).role !== 'admin' && (req.user as any).role !== 'ftp' && (req.user as any).role !== 'fto')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await storage.deleteAnnouncement(Number(req.params.id));
    res.json({ success: true });
  });

  // === APPLICATIONS ===
  app.get(api.applications.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    const user = req.user as any;
    
    // Admins and high roles see everything, citizens only see their own
    const list = await storage.getApplications();
    if (user.role === 'admin' || user.role === 'ftp' || user.role === 'fto') {
      return res.json(list);
    }
    
    // For regular users, only return their own applications
    const filtered = list.filter(app => app.userId === user.id);
    res.json(filtered);
  });

  app.post(api.applications.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    
    // Check if applications are open
    const open = await storage.getSetting("applications_open");
    if (open === false) {
      return res.status(403).json({ message: "Applications are currently closed" });
    }

    const input = insertApplicationSchema.parse(req.body);

    const existing = await storage.getApplicationByUser((req.user as any).id, input.type);
    if (existing && existing.status === 'pending') {
      return res.status(400).json({ message: "لديك طلب قيد المراجعة بالفعل لهذا المنصب" });
    }

    const app = await storage.createApplication({ ...input, userId: (req.user as any).id });
    res.status(201).json(app);
  });

  app.patch(api.applications.updateStatus.path, async (req, res) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || (user.role !== 'admin' && user.role !== 'ftp' && user.role !== 'fto')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { status } = req.body;
    const updated = await storage.updateApplicationStatus(Number(req.params.id), status);
    res.json(updated);
  });

  app.delete(api.applications.delete.path, async (req, res) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || (user.role !== 'admin' && user.role !== 'ftp' && user.role !== 'fto')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await storage.deleteApplication(Number(req.params.id));
    res.json({ success: true });
  });

  // === TASKS ===
  app.get(api.tasks.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    const user = req.user as any;
    if (user.role !== 'admin' && user.role !== 'recruit' && user.role !== 'police') {
      return res.status(403).json({ message: "Access denied" });
    }
    const list = await storage.getTasks();
    res.json(list);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(403).json({ message: "Admin only" });
    }
    const input = insertTaskSchema.parse(req.body);
    const item = await storage.createTask({ ...input, createdBy: (req.user as any).id });
    res.status(201).json(item);
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(403).json({ message: "Admin only" });
    }
    await storage.deleteTask(Number(req.params.id));
    res.json({ success: true });
  });
  app.get(api.settings.get.path, async (req, res) => {
    const val = await storage.getSetting(req.params.key);
    res.json({ value: val });
  });

  app.post(api.settings.update.path, async (req, res) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || (user.role !== 'admin' && user.role !== 'ftp' && user.role !== 'fto')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await storage.updateSetting(req.params.key, req.body.value);
    res.json({ success: true });
  });

  app.post("/api/admin/update-role", async (req, res) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || (user.role !== 'admin' && user.role !== 'ftp' && user.role !== 'fto')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { username, role } = req.body;
    const targetUser = await storage.getUserByUsername(username);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    await storage.updateUserRole(targetUser.id, role);
    res.json({ success: true });
  });

  app.get("/api/admin/users", async (req, res) => {
    const user = req.user as any;
    if (!req.isAuthenticated() || user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    const allUsers = await db.select().from(usersTable);
    res.json(allUsers);
  });

  // === RANKS & RULES ===
  app.get(api.ranks.list.path, async (req, res) => {
    const list = await storage.getRanks();
    res.json(list);
  });

  app.get(api.rules.list.path, async (req, res) => {
    const list = await storage.getRules();
    res.json(list);
  });

  // Seed data function
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUserByUsername("admin");
  if (!users) {
    console.log("Seeding admin user...");
    await storage.createUser({ username: "admin", password: "adminpassword" });
    // Update role separately if needed, but storage.createUser already defaults to user.
    // Let's modify the seed to use a more direct approach if we want an admin.
    const admin = await storage.getUserByUsername("admin");
    if (admin) {
      await db.update(usersTable).set({ role: "admin" }).where(eq(usersTable.id, admin.id));
    }
  }

  const settings = await storage.getSetting("applications_open");
  if (settings === null) {
    await storage.updateSetting("applications_open", true);
  }

  const ranks = await storage.getRanks();
  if (ranks.length === 0 || ranks.length <= 9) { // Check if we need to update to the new structure
    console.log("Seeding ranks...");
    const defaultRanks = [
      { title: "Police Chief", name: "Abdulrahman Alkhalid", code: "A-1", order: 1 },
      { title: "Deputy Police Chief", name: "Shibbeb haron", code: "A-2", order: 2 },
      { title: "General", name: "Abo Sultan", code: "P-3", order: 3 },
      { title: "General", name: "Demitri Smith", code: "P-2", order: 4 },
      { title: "General", name: "Faleh Al-Subaie", code: "P-1", order: 5 },
      { title: "General", name: "Ethen Dawosn", code: "P-0", order: 6 },
      { title: "Lieutenant", name: "JAX MURPHY", code: "C-7", order: 7 },
      { title: "Lieutenant", name: "Mark Murphy", code: "C-8", order: 8 },
      { title: "Lieutenant", name: "Alexander Falcone", code: "C-9", order: 9 },
    ];
    
    // Clear old ranks
    await db.delete(ranksTable);
    for (const r of defaultRanks) await storage.createRank(r);
  }

  const rules = await storage.getRules();
  if (rules.length === 0 || rules.length < 20) {
    console.log("Seeding rules from Drive document...");
    const driveRules = [
      { category: "قوانين عامة", content: "عدم التسلط على المواطنين والرتب الأقل منك والاحترام المتبادل واجب" },
      { category: "قوانين عامة", content: "الجدية في العمل وعدم أخذ الوظيفة على محمل كوميدي وتقمص شخصية العسكري" },
      { category: "قوانين عامة", content: "الالتزام بالملابس والمركبات والأسلحة الخاصة برتبتك" },
      { category: "قوانين عامة", content: "يمنع التجارة أو بيع او إعطاء معدات الشرطة للمواطنين أو المسعفين" },
      { category: "قوانين عامة", content: "يمنع استخدام سيارات المواطنين والمدنيين (اطلب وحدة نقل)" },
      { category: "قوانين عامة", content: "عدم اظهار السلاح الناري او التيزر الا لسبب منطقي وفي الحالات القصوى" },
      { category: "قوانين عامة", content: "لا يحق لك ارسال الشخص للسجن بدون وجود دليل مثبت على جريمته" },
      { category: "قوانين عامة", content: "تفتيش الشخص وأخذ جميع الممنوعات الإجرامية ووضعها في الارشيف قبل السجن" },
      { category: "قوانين عامة", content: "السلاح الأبيض لا يسحب الا في حال استخدامه في محاولة قتل" },
      { category: "قوانين عامة", content: "استخدام الراديو للتبليغ فقط والالتزام بالبروتوكولات العسكرية" },
      { category: "قوانين عامة", content: "ضرب التحية العسكرية إجباري ومن يرفض سيحاسب" },
      { category: "قوانين عامة", content: "لا يسمح بتفتيش مواطن إلا في المركز أو حالات الاشتباه أو لبس قناع" },
      { category: "قوانين إطلاق النار", content: "يُمنع إطلاق النار بدون تحذير لفظي أو طلقة تحذيرية" },
      { category: "قوانين إطلاق النار", content: "إطلاق النار على الكفرات فقط في حالات الدهس المتعمد أو انتهاء زمن المطاردة" },
      { category: "قوانين إطلاق النار", content: "إطلاق النار على الشخص في حال مبادرة المجرمين بالإطلاق أو محاولة القتل" },
      { category: "التعامل مع المجرمين", content: "لا يحق الكلبشة في المخالفات المرورية إلا في حال عدم التعاون" },
      { category: "التعامل مع المجرمين", content: "ذكر التهمة للشخص والتأكد من سماعها كاملة" },
      { category: "التعامل مع المجرمين", content: "ذكر جميع الحقوق (ميراندا) للمقبوض عليه" },
      { category: "التعامل مع المجرمين", content: "تجهيز الأدلة قبل الوصول للمركز" },
      { category: "التعامل مع المجرمين", content: "خصم 40% من المحكومية في حال الاعتراف بوجود محامي" },
      { category: "التعامل مع المجرمين", content: "خصم 20% في حال الإقرار بالجريمة بشكل كامل وواضح" },
      { category: "قوانين النطح", content: "النطح في حال الهرب بدون سلاح ومرور 30 ثانية مطاردة أقدام" },
      { category: "قوانين التيزر", content: "استخدام التيزر في حال السلاح الأبيض أو التوجه لمركبة للهرب" },
      { category: "قوانين الراديو", content: "يمنع المزح أو الألفاظ النابية أو مناقشة الأوامر في الراديو" }
    ];
    await db.delete(rulesTable);
    for (const r of driveRules) await storage.createRule(r);
  }
}
