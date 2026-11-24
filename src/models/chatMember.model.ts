import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/db";

class ChatMember extends Model<InferAttributes<ChatMember>, InferCreationAttributes<ChatMember>> {
  declare id: CreationOptional<number>;
  declare chatId: number;
  declare userId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ChatMember.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    chatId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "chats", key: "id" },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "chat_members",
    indexes: [{ unique: true, fields: ["chat_id", "user_id"] }],
  },
);

export default ChatMember;
