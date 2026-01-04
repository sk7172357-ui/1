import { z } from 'zod';

export const api = {
  status: {
    get: {
      method: 'GET' as const,
      path: '/api/status',
      responses: {
        200: z.object({
          status: z.string(),
          uptime: z.number(),
        }),
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.object({
          timestamp: z.string(),
          level: z.string(),
          message: z.string(),
        })),
      },
    },
  },
};
