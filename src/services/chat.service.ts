import { UniqueConstraintError } from "sequelize";
import sequelize from "../config/db";
import { Chat, ChatMember, User } from "../models";

const getPairKey = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`);

const chatService = {
  // returns the existing chat between two users, or creates a new one
  findOrCreate: async (userAId: number, userBId: number) => {
    const pairKey = getPairKey(userAId, userBId);
    try {
      const existing = await Chat.findOne({ where: { pairKey } });
      if (existing) return { chat: existing, created: false };

      const chat = await sequelize.transaction(async (transaction) => {
        const newChat = await Chat.create({ pairKey }, { transaction });
        await ChatMember.bulkCreate(
          [
            { chatId: newChat.id, userId: userAId },
            { chatId: newChat.id, userId: userBId },
          ],
          { transaction },
        );
        return newChat;
      });
      return { chat, created: true };
    } catch (err) {
      // two requests came at the same time and the other one already created it
      if (err instanceof UniqueConstraintError) {
        const chat = await Chat.findOne({ where: { pairKey } }).catch(() => null);
        if (chat) return { chat, created: false };
      }
      console.log("DB error: chat findOrCreate failed", err);
      return false;
    }
  },

  findById: async (chatId: number) => {
    try {
      return await Chat.findByPk(chatId);
    } catch (err) {
      console.log("DB error: chat findById failed", err);
      return false;
    }
  },

  isMember: async (chatId: number, userId: number) => {
    try {
      const member = await ChatMember.findOne({ where: { chatId, userId } });
      return member !== null;
    } catch (err) {
      console.log("DB error: chat isMember failed", err);
      return null;
    }
  },

  // all chats of a user with their member ids, latest active chat first
  listByUser: async (userId: number) => {
    try {
      const memberships = await ChatMember.findAll({ where: { userId }, attributes: ["chatId"] });
      const chatIds = memberships.map((m) => m.chatId);
      if (!chatIds.length) return [];

      const chats = await Chat.findAll({
        where: { id: chatIds },
        include: [{ model: User, as: "members", attributes: ["id", "name"], through: { attributes: [] } }],
        order: [["updatedAt", "DESC"]],
      });

      return chats.map((chat) => ({
        chatId: chat.id,
        memberIds: (chat.members || []).map((u) => u.id),
        members: (chat.members || []).map((u) => ({ id: u.id, name: u.name })),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      }));
    } catch (err) {
      console.log("DB error: chat listByUser failed", err);
      return false;
    }
  },

  // bump updated_at on new message so chat list stays sorted by latest activity
  touch: async (chatId: number) => {
    try {
      await Chat.update({ updatedAt: new Date() }, { where: { id: chatId } });
    } catch (err) {
      console.log("DB error: chat touch failed", err);
    }
  },
};

export default chatService;
