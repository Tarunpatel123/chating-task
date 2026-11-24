import Chat from "./chat.model";
import ChatMember from "./chatMember.model";
import User from "./user.model";

// users <-> chats is many-to-many through chat_members
User.belongsToMany(Chat, { through: ChatMember, foreignKey: "userId", otherKey: "chatId", as: "chats" });
Chat.belongsToMany(User, { through: ChatMember, foreignKey: "chatId", otherKey: "userId", as: "members" });

ChatMember.belongsTo(User, { foreignKey: "userId" });
ChatMember.belongsTo(Chat, { foreignKey: "chatId" });

export { Chat, ChatMember, User };
