import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import { generateResponse } from './openai';

let bot: TelegramBot | null = null;

export function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("Skipping Telegram Bot start: TELEGRAM_BOT_TOKEN not set");
    return;
  }

  // Use polling for simplicity in this environment
  bot = new TelegramBot(token, { polling: true });

  console.log("Telegram Bot started!");

  bot.on('message', async (msg) => {
    if (!msg.from) return;

    const chatId = msg.chat.id;
    const text = msg.text;
    const telegramId = msg.from.id.toString();

    if (!text) return;

    try {
      // 1. Get or Create User
      let user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        user = await storage.createUser({
          telegramId,
          username: msg.from.username || null,
          firstName: msg.from.first_name || null,
          lastName: msg.from.last_name || null,
        });
      }

      // 2. Check Human Mode
      if (user.isHumanMode) {
        // If in human mode, we stop responding automatically.
        // In a real scenario, this is where the human owner would reply.
        console.log(`[Human Mode] Message from ${user.username}: ${text}`);
        return;
      }

      // 3. Save User Message
      await storage.addMessage({
        userId: user.id,
        role: 'user',
        content: text
      });

      // 4. Check for Handover Triggers
      const handoverTriggers = [
        "какие планы на вечер",
        "что делаешь сегодня",
        "у тебя есть планы",
        "никаких планов",
        "пока не знаю"
      ];
      
      const lowerText = text.toLowerCase();
      const shouldHandover = handoverTriggers.some(trigger => lowerText.includes(trigger));

      if (shouldHandover) {
        await storage.updateUser(user.id, { isHumanMode: true });
        await bot?.sendMessage(chatId, "..."); // Placeholder/Pause
        console.log(`[Handover] User ${user.username} triggered handover.`);
        // Notify admin/owner here if possible
        return;
      }

      // 5. Update Active Time (Simplified)
      const now = new Date();
      await storage.updateUser(user.id, { lastInteractionAt: now });

      // 6. Generate AI Response
      // Fetch recent history
      const history = await storage.getMessages(user.id, 10);
      const formattedHistory = history.map(m => ({ role: m.role, content: m.content }));
      
      // Add artificial delay for realism (2-5 seconds)
      const delay = Math.floor(Math.random() * 3000) + 2000;
      await new Promise(r => setTimeout(r, delay));

      // Simulate typing
      await bot?.sendChatAction(chatId, 'typing');
      
      const responseText = await generateResponse(formattedHistory);

      // 7. Send Response
      await bot?.sendMessage(chatId, responseText);
      await storage.addMessage({
        userId: user.id,
        role: 'assistant',
        content: responseText
      });

    } catch (error) {
      console.error("Bot Error:", error);
    }
  });

  bot.on("polling_error", (msg) => console.log("Polling Error:", msg));
}
