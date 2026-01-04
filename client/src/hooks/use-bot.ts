import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Manually defining missing schema types for the UI features requested
// These match the database schema provided in the prompt
const UserSchema = z.object({
  id: z.number(),
  telegramId: z.string(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  isHumanMode: z.boolean(),
  activeSeconds: z.number(),
  lastInteractionAt: z.string().nullable(), // API returns JSON strings for dates
});

const MessageSchema = z.object({
  id: z.number(),
  role: z.string(),
  content: z.string(),
  timestamp: z.string(),
});

export type BotUser = z.infer<typeof UserSchema>;
export type BotMessage = z.infer<typeof MessageSchema>;

// ==========================================
// Status & Logs (Defined in Routes Manifest)
// ==========================================

export function useBotStatus() {
  return useQuery({
    queryKey: [api.status.get.path],
    queryFn: async () => {
      const res = await fetch(api.status.get.path);
      if (!res.ok) throw new Error("Failed to fetch status");
      return api.status.get.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Real-time pulse
  });
}

export function useBotLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
    refetchInterval: 2000, // Live logs
  });
}

// ==========================================
// Users & Handovers (Implied Features)
// ==========================================

export function useUsers() {
  return useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) {
        // Fallback for demo if backend endpoint missing
        if (res.status === 404) return []; 
        throw new Error("Failed to fetch users");
      }
      return z.array(UserSchema).parse(await res.json());
    },
  });
}

export function useHumanHandovers() {
  return useQuery({
    queryKey: ["/api/users", "handovers"],
    queryFn: async () => {
      // In a real app, query param ?mode=human might be used
      const res = await fetch("/api/users?mode=human");
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error("Failed to fetch handovers");
      }
      return z.array(UserSchema).parse(await res.json());
    },
  });
}

export function useUserMessages(userId: number) {
  return useQuery({
    queryKey: ["/api/users", userId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/messages`);
      if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error("Failed to fetch messages");
      }
      return z.array(MessageSchema).parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useUpdateHumanMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isHumanMode }: { userId: number; isHumanMode: boolean }) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHumanMode }),
      });
      if (!res.ok) throw new Error("Failed to update user mode");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useUpdateBotToken() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("Failed to update token");
      return res.json();
    },
  });
}
