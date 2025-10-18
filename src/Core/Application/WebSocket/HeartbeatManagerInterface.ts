export interface HeartbeatManagerInterface {
  startHeartbeat(onHeartbeat: () => void): NodeJS.Timeout
}
