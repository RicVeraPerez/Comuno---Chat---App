import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
  set({ isMessagesLoading: true });
  try {
    const res = await axiosInstance.get(`/messages/${userId}`);
    set({ messages: res.data });
  } catch (error) {
    toast.error(error.response?.data?.message || "Error al cargar mensajes");
  } finally {
    set({ isMessagesLoading: false });
  }
},

sendMessage: async (messageData) => {
  const { selectedUser } = get();
  try {
    await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
    // No hacemos nada aquí, el socket emitirá y se recibirá por "newMessage"
  } catch (error) {
    toast.error(error.response?.data?.message || "Error al enviar mensaje");
  }
},

subscribeToMessages: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) return;

  socket.on("newMessage", (newMessage) => {
    const { selectedUser, messages } = get();

    const isRelevant =
      newMessage.senderId === selectedUser?._id ||
      newMessage.receiverId === selectedUser?._id;

    if (!isRelevant) return;

    const alreadyExists = messages.some((m) => m._id === newMessage._id);
    if (alreadyExists) return;

    set({ messages: [...messages, newMessage] });
  });
},


  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    get().unsubscribeFromMessages();
    set({ selectedUser, messages: [] });
    get().getMessages(selectedUser._id);
    get().subscribeToMessages();
  }
}));