import { io, Socket } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

let socket: Socket | null = null;

// Singleton — one connection shared across whichever pages need it,
// rather than opening a new socket per component mount.
export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem("authToken");
    socket = io(API_BASE, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      auth: { token },
    });
  }
  return socket;
}

// Call after login/logout so a fresh socket picks up the new (or cleared) token
export function resetSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinFormRoom(formId: string) {
  getSocket().emit("join_form", formId);
}

export function leaveFormRoom(formId: string) {
  getSocket().emit("leave_form", formId);
}

