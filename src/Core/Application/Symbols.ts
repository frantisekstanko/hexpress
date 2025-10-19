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
import { createTypedSymbol } from '@/Core/Application/ServiceToken'
import { TransactionalExecutorInterface } from '@/Core/Application/TransactionalExecutorInterface'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { AuthenticationHandlerInterface } from '@/Core/Application/WebSocket/AuthenticationHandlerInterface'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ConnectionValidatorInterface } from '@/Core/Application/WebSocket/ConnectionValidatorInterface'
import { HeartbeatManagerInterface } from '@/Core/Application/WebSocket/HeartbeatManagerInterface'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'

export const Symbols = {
  ConfigInterface: createTypedSymbol<ConfigInterface>('ConfigInterface'),
  LoggerInterface: createTypedSymbol<LoggerInterface>('LoggerInterface'),
  DatabaseConnectionInterface: createTypedSymbol<DatabaseConnectionInterface>(
    'DatabaseConnectionInterface',
  ),
  DatabaseInterface: createTypedSymbol<DatabaseInterface>('DatabaseInterface'),
  DatabaseContextInterface: createTypedSymbol<DatabaseContextInterface>(
    'DatabaseContextInterface',
  ),
  TransactionalExecutorInterface:
    createTypedSymbol<TransactionalExecutorInterface>(
      'TransactionalExecutorInterface',
    ),
  CommandBusInterface: createTypedSymbol<CommandBusInterface>(
    'CommandBusInterface',
  ),
  CommandHandlerRegistryInterface:
    createTypedSymbol<CommandHandlerRegistryInterface>(
      'CommandHandlerRegistryInterface',
    ),
  RouterInterface: Symbol.for('RouterInterface'),
  ListenerProviderInterface: createTypedSymbol<ListenerProviderInterface>(
    'ListenerProviderInterface',
  ),
  EventDispatcherInterface: createTypedSymbol<EventDispatcherInterface>(
    'EventDispatcherInterface',
  ),
  FailedEventRepositoryInterface:
    createTypedSymbol<FailedEventRepositoryInterface>(
      'FailedEventRepositoryInterface',
    ),
  ApplicationVersionRepositoryInterface:
    createTypedSymbol<ApplicationVersionRepositoryInterface>(
      'ApplicationVersionRepositoryInterface',
    ),
  UuidRepositoryInterface: createTypedSymbol<UuidRepositoryInterface>(
    'UuidRepositoryInterface',
  ),
  NotificationServiceInterface: createTypedSymbol<NotificationServiceInterface>(
    'NotificationServiceInterface',
  ),
  WebSocketServerInterface: createTypedSymbol<WebSocketServerInterface>(
    'WebSocketServerInterface',
  ),
  WebSocketMessageParserInterface:
    createTypedSymbol<WebSocketMessageParserInterface>(
      'WebSocketMessageParserInterface',
    ),
  ConnectionValidatorInterface: createTypedSymbol<ConnectionValidatorInterface>(
    'ConnectionValidatorInterface',
  ),
  AuthenticationHandlerInterface:
    createTypedSymbol<AuthenticationHandlerInterface>(
      'AuthenticationHandlerInterface',
    ),
  HeartbeatManagerInterface: createTypedSymbol<HeartbeatManagerInterface>(
    'HeartbeatManagerInterface',
  ),
  BroadcasterInterface: createTypedSymbol<BroadcasterInterface>(
    'BroadcasterInterface',
  ),
  ErrorHandlerMiddleware: Symbol.for('ErrorHandlerMiddleware'),
  CorsMiddleware: Symbol.for('CorsMiddleware'),
  TimeoutMiddleware: Symbol.for('TimeoutMiddleware'),
  NotFoundMiddleware: Symbol.for('NotFoundMiddleware'),
  FilesystemInterface: Symbol.for('FilesystemInterface'),
  ApplicationFactoryInterface: createTypedSymbol<ApplicationFactoryInterface>(
    'ApplicationFactoryInterface',
  ),
  ClockInterface: createTypedSymbol<ClockInterface>('ClockInterface'),
  ControllerResolverInterface: createTypedSymbol<ControllerResolverInterface>(
    'ControllerResolverInterface',
  ),
  RouteProviderInterface: createTypedSymbol<RouteProviderInterface>(
    'RouteProviderInterface',
  ),
}
