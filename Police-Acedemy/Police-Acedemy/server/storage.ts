import { 
  User, 
  InsertUser, 
  Announcement, 
  InsertAnnouncement, 
  Application, 
  InsertApplication, 
  Rank, 
  Rule,
  Task,
  InsertTask,
  users, 
  announcements, 
  applications, 
  ranks, 
  rules, 
  tasks,
  settings 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement & { createdBy: number }): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;

  // Applications
  createApplication(app: InsertApplication & { userId: number }): Promise<Application>;
  getApplications(): Promise<(Application & { user: User })[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<void>;
  getApplicationByUser(userId: number, type?: string): Promise<Application | undefined>;

  // Ranks
  getRanks(): Promise<Rank[]>;
  createRank(rank: any): Promise<Rank>; // Simplified for seeding

  // Rules
  getRules(): Promise<Rule[]>;
  createRule(rule: any): Promise<Rule>; // Simplified for seeding

  // Settings
  getSetting(key: string): Promise<any>;
  updateSetting(key: string, value: any): Promise<void>;

  // Tasks
  getTasks(): Promise<(Task & { user: User })[]>;
  createTask(task: InsertTask & { createdBy: number }): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor(sessionStore: any) {
    this.sessionStore = sessionStore;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement & { createdBy: number }): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Applications
  async createApplication(app: InsertApplication & { userId: number }): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async getApplications(): Promise<(Application & { user: User })[]> {
    const results = await db
      .select({
        application: applications,
        user: users,
      })
      .from(applications)
      .innerJoin(users, eq(applications.userId, users.id))
      .orderBy(desc(applications.createdAt));
    
    return results.map(r => ({ 
      ...r.application, 
      user: r.user,
    }));
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [updated] = await db.update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  async getApplicationByUser(userId: number, type?: string): Promise<Application | undefined> {
    const query = db.select().from(applications).where(eq(applications.userId, userId));
    if (type) {
      const [app] = await db.select().from(applications).where(
        eq(applications.userId, userId) && eq(applications.type, type)
      );
      return app;
    }
    const [app] = await query;
    return app;
  }

  // Ranks
  async getRanks(): Promise<Rank[]> {
    return await db.select().from(ranks).orderBy(ranks.order);
  }

  async createRank(rank: any): Promise<Rank> {
    const [newRank] = await db.insert(ranks).values(rank).returning();
    return newRank;
  }

  // Rules
  async getRules(): Promise<Rule[]> {
    return await db.select().from(rules).orderBy(rules.id);
  }

  async createRule(rule: any): Promise<Rule> {
    const [newRule] = await db.insert(rules).values(rule).returning();
    return newRule;
  }

  // Tasks
  async getTasks(): Promise<(Task & { user: User })[]> {
    const results = await db
      .select({
        task: tasks,
        user: users,
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.createdBy, users.id))
      .orderBy(desc(tasks.createdAt));
    
    return results.map(r => ({ 
      ...r.task, 
      user: r.user,
    }));
  }

  async createTask(task: InsertTask & { createdBy: number }): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Settings
  async getSetting(key: string): Promise<any> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting ? JSON.parse(setting.value) : null;
  }

  async updateSetting(key: string, value: any): Promise<void> {
    const strValue = JSON.stringify(value);
    await db.insert(settings)
      .values({ key, value: strValue })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: strValue },
      });
  }
}

import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({
  pool,
  createTableIfMissing: true,
});

export const storage = new DatabaseStorage(sessionStore);
