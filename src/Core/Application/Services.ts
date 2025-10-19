import { ApplicationFactoryInterface } from '@/Core/Application/ApplicationFactoryInterface'
import { ApplicationVersionRepositoryInterface } from '@/Core/Application/ApplicationVersionRepositoryInterface'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ControllerResolverInterface } from '@/Core/Application/Controller/ControllerResolverInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { FailedEventRepositoryInterface } from '@/Core/Application/Event/FailedEventRepositoryInterface'
import { ListenerProviderInterface } from '@/Core/Application/Event/ListenerProviderInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { createServiceToken } from '@/Core/Application/ServiceToken'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { AuthenticationHandlerInterface } from '@/Core/Application/WebSocket/AuthenticationHandlerInterface'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ConnectionValidatorInterface } from '@/Core/Application/WebSocket/ConnectionValidatorInterface'
import { HeartbeatManagerInterface } from '@/Core/Application/WebSocket/HeartbeatManagerInterface'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'

export const Services = {
  ConfigInterface: createServiceToken<ConfigInterface>('ConfigInterface'),
  LoggerInterface: createServiceToken<LoggerInterface>('LoggerInterface'),
  DatabaseConnectionInterface: createServiceToken<DatabaseConnectionInterface>(
    'DatabaseConnectionInterface',
  ),
  DatabaseInterface: createServiceToken<DatabaseInterface>('DatabaseInterface'),
  DatabaseContextInterface: createServiceToken<DatabaseContextInterface>(
    'DatabaseContextInterface',
  ),
  TransactionalExecutorInterface:
    createServiceToken<TransactionalExecutorInterface>(
      'TransactionalExecutorInterface',
    ),
  CommandBusInterface: createServiceToken<CommandBusInterface>(
    'CommandBusInterface',
  ),
  CommandHandlerRegistryInterface:
    createServiceToken<CommandHandlerRegistryInterface>(
      'CommandHandlerRegistryInterface',
    ),
  RouterInterface: Symbol.for('RouterInterface'),
  ListenerProviderInterface: createServiceToken<ListenerProviderInterface>(
    'ListenerProviderInterface',
  ),
  EventDispatcherInterface: createServiceToken<EventDispatcherInterface>(
    'EventDispatcherInterface',
  ),
  FailedEventRepositoryInterface:
    createServiceToken<FailedEventRepositoryInterface>(
      'FailedEventRepositoryInterface',
    ),
  ApplicationVersionRepositoryInterface:
    createServiceToken<ApplicationVersionRepositoryInterface>(
      'ApplicationVersionRepositoryInterface',
    ),
  UuidRepositoryInterface: createServiceToken<UuidRepositoryInterface>(
    'UuidRepositoryInterface',
  ),
  NotificationServiceInterface:
    createServiceToken<NotificationServiceInterface>(
      'NotificationServiceInterface',
    ),
  WebSocketServerInterface: createServiceToken<WebSocketServerInterface>(
    'WebSocketServerInterface',
  ),
  WebSocketMessageParserInterface:
    createServiceToken<WebSocketMessageParserInterface>(
      'WebSocketMessageParserInterface',
    ),
  ConnectionValidatorInterface:
    createServiceToken<ConnectionValidatorInterface>(
      'ConnectionValidatorInterface',
    ),
  AuthenticationHandlerInterface:
    createServiceToken<AuthenticationHandlerInterface>(
      'AuthenticationHandlerInterface',
    ),
  HeartbeatManagerInterface: createServiceToken<HeartbeatManagerInterface>(
    'HeartbeatManagerInterface',
  ),
  BroadcasterInterface: createServiceToken<BroadcasterInterface>(
    'BroadcasterInterface',
  ),
  ErrorHandlerMiddleware: Symbol.for('ErrorHandlerMiddleware'),
  CorsMiddleware: Symbol.for('CorsMiddleware'),
  TimeoutMiddleware: Symbol.for('TimeoutMiddleware'),
  NotFoundMiddleware: Symbol.for('NotFoundMiddleware'),
  FilesystemInterface: Symbol.for('FilesystemInterface'),
  ApplicationFactoryInterface: createServiceToken<ApplicationFactoryInterface>(
    'ApplicationFactoryInterface',
  ),
  ClockInterface: createServiceToken<ClockInterface>('ClockInterface'),
  ControllerResolverInterface: createServiceToken<ControllerResolverInterface>(
    'ControllerResolverInterface',
  ),
  RouteProviderInterface: createServiceToken<RouteProviderInterface>(
    'RouteProviderInterface',
  ),
}
