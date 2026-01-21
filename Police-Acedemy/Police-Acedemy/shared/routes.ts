import { z } from 'zod';
import { 
  insertUserSchema, 
  insertAnnouncementSchema, 
  insertApplicationSchema, 
  insertRankSchema, 
  insertRuleSchema,
  insertTaskSchema,
  users, 
  announcements, 
  applications, 
  ranks, 
  rules,
  tasks
} from './schema';

// === SHARED ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// === API CONTRACT ===
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  },
  announcements: {
    list: {
      method: 'GET' as const,
      path: '/api/announcements',
      responses: {
        200: z.array(z.custom<typeof announcements.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/announcements',
      input: insertAnnouncementSchema,
      responses: {
        201: z.custom<typeof announcements.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/announcements/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
  },
  applications: {
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }), // If closed
      },
    },
    list: { // Admin only
      method: 'GET' as const,
      path: '/api/applications',
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect & { user: typeof users.$inferSelect }>()),
        403: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/applications/:id/status',
      input: z.object({ status: z.enum(['approved', 'rejected', 'pending']) }),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/applications/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:key',
      responses: {
        200: z.object({ value: z.any() }),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings/:key',
      input: z.object({ value: z.any() }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  ranks: {
    list: {
      method: 'GET' as const,
      path: '/api/ranks',
      responses: {
        200: z.array(z.custom<typeof ranks.$inferSelect>()),
      },
    },
  },
  rules: {
    list: {
      method: 'GET' as const,
      path: '/api/rules',
      responses: {
        200: z.array(z.custom<typeof rules.$inferSelect>()),
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
  },
};

// === HELPER ===
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// === TYPE HELPERS — Infer types from schemas ===
export type User = typeof users.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Rank = typeof ranks.$inferSelect;
export type Rule = typeof rules.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
