import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { HeartbeatManagerInterface } from '@/Core/Application/WebSocket/HeartbeatManagerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'

export class HeartbeatManager implements HeartbeatManagerInterface {
  private readonly heartbeatIntervalMs: number

  constructor(private readonly config: ConfigInterface) {
    const heartbeatInterval = Number(
      this.config.get(ConfigOption.WEBSOCKET_HEARTBEAT_INTERVAL_MS),
    )

    Assertion.number(
      heartbeatInterval,
      'WebSocket heartbeat interval must be a number',
    )
    Assertion.greaterThan(
      heartbeatInterval,
      0,
      'WebSocket heartbeat interval must be greater than 0',
    )

    this.heartbeatIntervalMs = heartbeatInterval
  }

  startHeartbeat(onHeartbeat: () => void): NodeJS.Timeout {
    return setInterval(onHeartbeat, this.heartbeatIntervalMs)
  }
}
