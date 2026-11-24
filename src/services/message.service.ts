import { DocumentSnapshot, FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import firestore from "../config/firebase";

/*
  Firestore structure:
  chats/{chatId}/messages/{messageId}  -> { senderId, text, createdAt, readBy: { userId: time }, isEdited, isDeleted }
  chats/{chatId}/lastSeen/{userId}     -> { messageId, updatedAt }
*/

const messagesRef = (chatId: number) => firestore.collection("chats").doc(String(chatId)).collection("messages");
const lastSeenRef = (chatId: number) => firestore.collection("chats").doc(String(chatId)).collection("lastSeen");

const toDate = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null);

const formatMessage = (doc: DocumentSnapshot) => {
  const data = doc.data() || {};
  const readBy: Record<string, Date | null> = {};
  for (const [userId, time] of Object.entries(data.readBy || {})) readBy[userId] = toDate(time);

  return {
    id: doc.id,
    senderId: data.senderId as number,
    text: data.isDeleted ? "" : (data.text as string),
    createdAt: toDate(data.createdAt),
    readBy,
    isEdited: Boolean(data.isEdited),
    isDeleted: Boolean(data.isDeleted),
  };
};

const messageService = {
  send: async (chatId: number, senderId: number, text: string) => {
    try {
      const ref = await messagesRef(chatId).add({
        senderId,
        text,
        createdAt: FieldValue.serverTimestamp(),
        readBy: {},
        isEdited: false,
        isDeleted: false,
      });
      return formatMessage(await ref.get());
    } catch (err) {
      console.log("Firestore error: message send failed", err);
      return false;
    }
  },

  list: async (chatId: number, limit: number) => {
    try {
      // latest messages first from firestore, then reverse so the response is old -> new
      const snapshot = await messagesRef(chatId).orderBy("createdAt", "desc").limit(limit).get();
      return snapshot.docs.map(formatMessage).reverse();
    } catch (err) {
      console.log("Firestore error: message list failed", err);
      return false;
    }
  },

  findById: async (chatId: number, messageId: string) => {
    try {
      const doc = await messagesRef(chatId).doc(messageId).get();
      return doc.exists ? formatMessage(doc) : null;
    } catch (err) {
      console.log("Firestore error: message findById failed", err);
      return false;
    }
  },

  markRead: async (chatId: number, messageId: string, userId: number) => {
    try {
      // FieldPath is needed because the key is a number ("readBy.5" is not a valid path string)
      await messagesRef(chatId).doc(messageId).update(new FieldPath("readBy", String(userId)), FieldValue.serverTimestamp());
      return true;
    } catch (err) {
      console.log("Firestore error: markRead failed", err);
      return false;
    }
  },

  updateLastSeen: async (chatId: number, userId: number, messageId: string) => {
    try {
      await lastSeenRef(chatId).doc(String(userId)).set({ messageId, updatedAt: FieldValue.serverTimestamp() });
      return true;
    } catch (err) {
      console.log("Firestore error: updateLastSeen failed", err);
      return false;
    }
  },

  edit: async (chatId: number, messageId: string, text: string) => {
    try {
      const ref = messagesRef(chatId).doc(messageId);
      await ref.update({ text, isEdited: true });
      return formatMessage(await ref.get());
    } catch (err) {
      console.log("Firestore error: message edit failed", err);
      return false;
    }
  },

  remove: async (chatId: number, messageId: string) => {
    try {
      // soft delete, so ordering and read receipts are not affected
      await messagesRef(chatId).doc(messageId).update({ text: "", isDeleted: true });
      return true;
    } catch (err) {
      console.log("Firestore error: message delete failed", err);
      return false;
    }
  },
};

export default messageService;
