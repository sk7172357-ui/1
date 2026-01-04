import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { storage } from "./storage";
import { generateResponse } from "./openai";
import { Api } from "telegram/tl";
import input from "input";

let client: TelegramClient | null = null;

export async function startUserBot() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
  const apiHash = process.env.TELEGRAM_API_HASH || "";
  
  if (!apiId || !apiHash) {
    console.log("TELEGRAM_API_ID or TELEGRAM_API_HASH not set.");
    return;
  }

  const sessionConfig = { value: "1AgAOMTQ5LjE1NC4xNjcuNTEBu6dvftFJf6eLX6MPsXbi/MIqQ/nPRBDytgEoiUFeo4gQ9p4DbhzppHI3LQREJtJObYOnN71r+D7OKiiGD7wIc9YNPsn0gWZ3V1sVoDujwYgeWuO1HjUcwnIGx57tg7GhIMisiu8KUJZxs+j1qTNOF5+O6EwLoehA9b9oGwHazv8p/r8OEKOL7TB1hgehPuVqj4iLUuEl3kaLK5EPaGAx5lozt37HbBVLiWrNzMuBlOxSQdMsNOoDz9/uH4NxqDz/tP+IiVzwLBUpwiyUoza7q+Gf9jDu/OnF9xra+TexDkFmTVTtZV40r2fuzfBTONq3QLu/1W31k6sr7Z16AFvBMVA=" };
  const stringSession = new StringSession(sessionConfig.value);

  client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  console.log("UserBot connected with existing session!");

  // Notify owner on startup
  try {
    await client.sendMessage("me", { message: "Бот запущен и готов к работе!" });
  } catch (e) {
    console.error("Failed to send startup message:", e);
  }

  const configChannelId = await storage.getConfig("config_channel_id");

  // Handle configuration and bidirectional communication in control channel
  client.addEventHandler(async (event) => {
    const message = event.message;
    if (!configChannelId || !message.peerId) return;
    
    const isControlChannel = (message.peerId as any).channelId?.toString() === configChannelId.value.replace("-100", "");
    
    if (isControlChannel) {
      if (message.text && !message.out) {
        // Simple command handling for the owner bot
        const cmd = message.text.trim();
        if (cmd.startsWith("/prompt ")) {
          const newPrompt = cmd.replace("/prompt ", "");
          await storage.setConfig("ai_custom_instructions", newPrompt);
          await client?.sendMessage(message.peerId, { message: "Инструкции AI обновлены на основе вашей команды." });
        } else {
          await storage.setConfig("ai_custom_instructions", message.text);
          await client?.sendMessage(message.peerId, { message: "Принято. Инструкции обновлены." });
        }
      }
    }
  }, new NewMessage({}));

  // Responding as Amina in private chats
  client.addEventHandler(async (event) => {
    const message = event.message;
    if (!message.isPrivate || message.out) return;

    const sender = await message.getSender() as Api.User;
    if (!sender || sender.bot) return;

    // Handle media (photos)
    if (message.photo) {
      await client?.sendMessage("me", { 
        message: `Пользователь ${sender.username || sender.id} прислал фото. Передаю диалог тебе.`,
      });
      await client?.forwardMessages("me", {
        messages: [message.id],
        fromPeer: message.peerId
      });
      
      const telegramId = sender.id.toString();
      let user = await storage.getUserByTelegramId(telegramId);
      if (user) {
        await storage.updateUser(user.id, { isHumanMode: true });
      }
      return;
    }

    const telegramId = sender.id.toString();
    const text = message.text;

    try {
      let user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        user = await storage.createUser({
          telegramId,
          username: sender.username || null,
          firstName: sender.firstName || null,
          lastName: sender.lastName || null,
        });
      }

      if (user.isHumanMode) return;
      await storage.addMessage({ userId: user.id, role: 'user', content: text });

      const customInstructions = await storage.getConfig("ai_custom_instructions");
      const history = await storage.getMessages(user.id, 10);
      const formattedHistory = history.map(m => ({ role: m.role, content: m.content }));
      
      const systemPrompt = "Ты Амина, 22-летняя девушка из Дагестана. Общайся естественно, по-дружески, иногда делай опечатки.";
      
      // Time-aware logic for plans
      const now = new Date();
      const hour = now.getHours();
      let timeContext = "";
      if (hour >= 22 || hour < 5) {
        timeContext = "\nСейчас поздняя ночь. Если заходит речь о планах, спрашивай про планы на завтра, а не на текущую ночь.";
      } else if (hour >= 18) {
        timeContext = "\nСейчас вечер. Можно спрашивать про планы на вечер или ночь.";
      }

      const activeInstructions = customInstructions ? `\n\nТекущие инструкции от владельца: ${customInstructions.value}` : "";
      
      formattedHistory.unshift({ role: 'system', content: systemPrompt + timeContext + activeInstructions });

      const responseText = await generateResponse(formattedHistory);

      // Realistic typing/recording simulation
      const textLen = responseText.length;
      const typingDelay = Math.min(10000, Math.max(2000, textLen * 50));
      
      if (responseText.includes("Голосовое:") || Math.random() > 0.9) {
        // Mocking voice recording for certain triggers or randomly
        await client?.invoke(new Api.messages.SetTyping({
          peer: message.peerId,
          action: new Api.SendMessageRecordAudioAction()
        }));
        await new Promise(r => setTimeout(r, typingDelay));
      } else {
        await client?.invoke(new Api.messages.SetTyping({
          peer: message.peerId,
          action: new Api.SendMessageTypingAction()
        }));
        await new Promise(r => setTimeout(r, typingDelay));
      }
      
      await client?.sendMessage(message.peerId, { message: responseText });
      await storage.addMessage({ userId: user.id, role: 'assistant', content: responseText });
      await storage.updateUser(user.id, { lastInteractionAt: new Date() });
    } catch (error) {
      console.error("UserBot Message Handling Error:", error);
    }
  }, new NewMessage({}));
}
