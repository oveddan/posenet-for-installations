export interface IConnectionState {
  socket?: WebSocket,
  status: "open" | "connecting" | "closed"
};
