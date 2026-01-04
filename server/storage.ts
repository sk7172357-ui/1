import { db } from "./db";
import { users, messages, config, type User, type InsertUser, type Message, type InsertMessage, type Config, type InsertConfig } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  addMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId: number, limit?: number): Promise<Message[]>;
  getConfig(key: string): Promise<Config | undefined>;
  setConfig(key: string, value: string): Promise<Config>;
}

export class DatabaseStorage implements IStorage {
  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.lastInteractionAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async getMessages(userId: number, limit = 50): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.userId, userId)).orderBy(messages.timestamp).limit(limit);
  }

  async getConfig(key: string): Promise<Config | undefined> {
    const [item] = await db.select().from(config).where(eq(config.key, key));
    return item;
  }

  async setConfig(key: string, value: string): Promise<Config> {
    const [item] = await db.insert(config)
      .values({ key, value })
      .onConflictDoUpdate({ target: config.key, set: { value, updatedAt: new Date() } })
      .returning();
    return item;
  }
}

export const storage = new DatabaseStorage();
