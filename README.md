# hexpress

[![License:
MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Coverage](https://img.shields.io/badge/Coverage-97%25-brightgreen.svg)]()

A production-grade TypeScript backend framework implementing true hexagonal
architecture with enforced dependency rules, automatic transaction management,
and event-driven design. Built for teams that need architectural rigor without
sacrificing developer experience.

## What Makes This Different

Most Express templates organize code into layers but don't enforce
architectural boundaries. Hexpress takes a fundamentally different approach by
implementing ports and adapters architecture with dependency rules enforced at
build time. Your domain layer genuinely cannot import from infrastructure. Your
application layer genuinely cannot depend on Express. These aren't guidelines,
they're compile-time guarantees verified by
[dependency cruiser](https://github.com/sverweij/dependency-cruiser) on every
build.

The architecture implements several advanced patterns typically found only in
enterprise-grade applications. Every write operation flows through a command
bus that automatically wraps execution in database transactions with proper
rollback handling. Domain entities record events during business operations,
which get dispatched to listeners only after successful transaction commits.
This ensures your event-driven side effects never execute on failed operations,
eliminating an entire category of consistency bugs.

Transaction management happens through a context pattern that makes database
transactions available throughout the call stack without explicit passing. When
a command executes, it runs within a transaction context that repositories
access implicitly. Domain events get collected in a parallel context during
command execution, then released and dispatched only after the transaction
commits. Failed operations roll back cleanly with no event dispatch.

The codebase enforces SOLID principles through its structure. Each module
follows strict layering with domain aggregates containing only pure business
logic, application services orchestrating use cases without knowing about HTTP
or databases, and infrastructure adapters handling external concerns. Interface
segregation separates read and write operations into different repository
contracts, enabling CQRS patterns where query optimization matters.

## Architecture Implementation

The framework organizes code into three distinct layers per module, with
dependency rules preventing lower layers from depending on outer layers. The
Domain layer contains business entities, value objects, domain events, and
repository interfaces. This layer has zero external dependencies and represents
pure business logic that could theoretically run in any environment.

The Application layer orchestrates domain logic to fulfill use cases. It
contains command handlers that execute business operations, application
services that coordinate multiple domain operations, event listeners that
respond to domain events, and repository interfaces defining persistence
contracts. This layer depends on domain but knows nothing about HTTP,
databases, or external services.

The Infrastructure layer provides concrete implementations of interfaces
defined in upper layers. It contains Express controllers handling HTTP
requests, MySQL repository implementations, WebSocket server setup, dependency
injection container configuration, and route definitions. This layer can depend
on everything above it but is kept thin, delegating all business logic to upper
layers.

Dependency boundaries get enforced through
[dependency cruiser](https://github.com/sverweij/dependency-cruiser) rules that
analyze import statements and fail builds on violations. The configuration
prevents domain code from importing application or infrastructure modules,
stops application code from depending on infrastructure, and blocks
cross-domain dependencies (where, for example, the User module code cannot
import from the Document module). This enforcement makes architectural
violations impossible to merge.

## Command Bus with Transactionality

The command bus implements a pattern where HTTP controllers don't call services
directly. Instead, they create command objects and dispatch them through the
bus. The bus locates the appropriate handler, wraps execution in a database
transaction, collects any domain events, commits on success, and dispatches
events only after commit. On failure, it rolls back the transaction with no
event dispatch.

```typescript
const documentId = await commandBus.dispatch(
  new CreateDocument({
    documentName: 'Technical Spec.md',
    owner: userId,
  }),
)
```

The command handler receives the command and delegates to domain services.
During execution, domain aggregates record events that get collected in an
async context. After the handler returns successfully, the transaction commits
and collected events flow to registered listeners.

```typescript
export class CreateDocumentCommandHandler
  implements CommandHandlerInterface<DocumentId>
{
  constructor(private readonly documentService: DocumentService) {}

  public async handle(command: CreateDocument): Promise<DocumentId> {
    return await this.documentService.createDocument(command)
  }
}
```

Domain aggregates record events using a base class that collects them for later
dispatch. These events stay internal until the command succeeds, ensuring
listeners never see events from failed operations.

```typescript
class Document extends EventRecording {
  static create({
    id,
    name,
    owner,
  }: {
    id: DocumentId
    name: DocumentName
    owner: UserId
  }): Document {
    const document = new Document({ id, name, owner, deleted: false })
    document.recordEvent(
      new DocumentWasCreated({
        documentId: id,
        documentName: name.toString(),
        ownerId: owner,
      }),
    )
    return document
  }
}
```

Transaction boundaries get managed automatically by the
[TransactionalExecutor](src/Core/Infrastructure/TransactionalExecutor.ts)
which creates a database context that repositories access throughout the call
stack. This eliminates the need to pass transaction objects through every
method call while maintaining proper isolation.

## Event-Driven Architecture

Domain events enable loosely coupled communication between modules. When a
document gets created, the domain aggregate records a
[DocumentWasCreated](src/Document/Domain/DocumentWasCreated.ts) event.
After transaction commit, the event dispatcher fans this out to all registered
listeners. One listener might send a WebSocket notification to connected
clients. Another might update search indexes. A third might publish to a
message queue for external systems.

The event system handles listener failures gracefully. If one listener throws
an exception, the dispatcher logs the failure, persists it to a
[FailedEventRepository](src/Core/Application/Event/FailedEventRepositoryInterface.ts)
for later investigation or retry, then continues dispatching to remaining
listeners. This prevents one broken listener from breaking the entire chain
and provides audit trails for debugging.

```typescript
class DocumentWasCreatedListener {
  constructor(
    private readonly notificationService: NotificationServiceInterface,
  ) {}

  public whenDocumentWasCreated(event: DocumentWasCreated): void {
    this.notificationService.notifyUser(event.ownerId, {
      type: 'DocumentWasCreated',
      data: {
        documentId: event.documentId.toString(),
        documentName: event.documentName,
      },
    })
  }
}
```

The listener registration system supports both specific event listeners and
global listeners that receive all events. This enables cross-cutting concerns
like audit logging, analytics tracking, or debugging without coupling to
specific domain events.

## Type Safety Through Value Objects

The codebase avoids primitive obsession by wrapping domain concepts in value
objects. Instead of passing string IDs around, methods accept strongly-typed
[DocumentId](src/Document/Domain/DocumentId.ts) or
[UserId](src/Core/Domain/UserId.ts) instances. This prevents mixing up IDs of
different types and enables validation at construction time.

```typescript
const documentId = DocumentId.fromString('550e8400-e29b-41d4-a716-446655440000')
const documentName = DocumentName.fromString('Quarterly Report')
```

Value objects validate invariants on creation.
[DocumentName](src/Document/Domain/DocumentName.ts) ensures names
aren't empty and don't exceed length limits. `UserId` validates UUID format.
[HashedPassword](src/User/Domain/HashedPassword.ts) encapsulates hashing
concerns so domain code never sees plaintext passwords. These validations
happen at the edges of your system, making core business logic operate only on
valid data.

The framework provides a custom assertion library that extends
[@frantisekstanko/assertion](https://github.com/frantisekstanko/assertion)
with domain-specific exception types. This enables runtime type checking
that integrates with the type system for parsing external data like HTTP
request bodies or database query results.

## Testing Strategy

The test suite implements three tiers of testing with different goals and
scope. Unit tests verify domain logic and application services in isolation
using mocked dependencies. These run fast and catch logic bugs early. Adapter
tests verify infrastructure components like repositories against real
databases, ensuring SQL queries work correctly and transactions behave
properly. Flow tests exercise the full stack from HTTP request through command
dispatch to database persistence, verifying the entire integration works
together.

The test infrastructure creates isolated databases per Jest worker, enabling
parallel test execution without conflicts. Each worker gets its own database
instance by appending the worker ID to the database name. Tests clean up after
themselves by dropping the worker-specific database.

```typescript
process.env.DB_NAME = process.env.DB_NAME + process.env.JEST_WORKER_ID
await testDatabase.create()
```

Flow tests use a [FlowTester](tests/_support/FlowTester.ts) helper that starts
the full Express application, creates authenticated HTTP requests via
[supertest](https://github.com/forwardemail/supertest), and verifies both HTTP
responses and database state after operations.
This catches integration issues that unit tests miss while maintaining
reasonable execution speed.

The framework includes test builders for creating domain entities with sensible
defaults, making test setup concise. Tests can override specific properties
while accepting defaults for everything else, reducing boilerplate without
sacrificing clarity.

## WebSocket Integration

The WebSocket implementation provides production-ready real-time communication
with authentication, connection management, and graceful shutdown. Clients
connect, authenticate via JWT tokens within a timeout window, then receive
real-time notifications as domain events occur.

The authentication flow requires clients to send a JWT access token immediately
after connecting. If authentication doesn't complete within the configured
timeout, the connection gets closed. After successful authentication, the
connection gets associated with a user ID for targeted broadcasting.

```typescript
webSocketServer.broadcast({
  type: 'notification',
  message: 'Document updated',
})
```

A [HeartbeatManager](src/Core/Infrastructure/WebSocket/HeartbeatManager.ts)
sends periodic ping messages to detect dead connections.
Clients must respond with pong messages or the connection gets closed. This
prevents accumulating dead connections when clients disconnect without proper
close handshakes.

The [ConnectionManager](src/Core/Infrastructure/WebSocket/ConnectionManager.ts)
tracks all active connections and their authentication state.
When the application shuts down, it iterates through connections and
closes them gracefully, preventing in-flight messages from getting lost.

Origin validation prevents unauthorized websites from establishing WebSocket
connections to your API. The configuration specifies allowed origins, and
connections from other origins get rejected during the handshake phase.

## Database Layer

The database abstraction provides type-safe query execution with connection
pooling, transaction management, and migration support. The implementation uses
[node-mysql2](https://github.com/sidorares/node-mysql2)
with promise-based APIs and proper connection lifecycle management.

Query results get parsed through a
[DatabaseRowMapper](src/Core/Infrastructure/DatabaseRowMapper.ts) that performs
runtime type checking and converts database primitives into domain value objects.
This catches type mismatches immediately rather than propagating invalid data
through the system.

```typescript
const row = await database.query('SELECT id, name FROM documents WHERE id = ?', [id])
const document = {
  id: DocumentId.fromString(DatabaseRowMapper.extractString(row, 'id')),
  name: DocumentName.fromString(DatabaseRowMapper.extractString(row, 'name')),
}
```

The migration system uses timestamp-based migration files that implement up and
down methods. Running migrations applies all pending migrations in order,
tracking applied migrations in a database table. The system injects the
database connection into migration classes, enabling complex schema changes
when needed.

Transactions get managed through a
[DatabaseContext](src/Core/Infrastructure/DatabaseContext.ts) that holds the
current transaction in async context. Repositories access this context to
execute queries within the transaction without receiving it as a parameter.
This keeps method signatures clean while maintaining proper transaction
boundaries.

## Security Implementation

Authentication uses Argon2id for password hashing with carefully tuned
parameters balancing security and performance. Argon2 provides resistance
against GPU-based attacks and side-channel attacks, making it more secure than
bcrypt for modern applications.

JWT tokens implement a dual-token pattern with short-lived access tokens and
longer-lived refresh tokens. Access tokens expire quickly to limit exposure if
compromised. Refresh tokens get stored in the database, enabling revocation
when users log out or when suspicious activity gets detected.

Token validation checks both JWT signature and database storage. This prevents
tokens from working after logout even if they haven't expired yet. The refresh
token gets deleted from the database on logout, immediately invalidating it.

WebSocket authentication validates JWT tokens before allowing connections to
receive messages. Unauthenticated connections have a timeout window to
authenticate or get disconnected, preventing resource exhaustion from
connections that never authenticate.

## Service Provider Pattern

The dependency injection setup uses a service provider pattern where each
module registers its own dependencies through a dedicated provider class. This
keeps container configuration modular and prevents a single giant registration
file.

```typescript
class ServiceProvider implements ServiceProviderInterface {
  register(container: ContainerInterface): void {
    container.register(
      DocumentService,
      (container) =>
        new DocumentService(
          container.get(CoreServices.UuidRepositoryInterface),
          container.get(Services.DocumentRepositoryInterface),
          container.get(CoreServices.EventCollectionContextInterface),
        ),
    )

    container.register(
      Services.DocumentRepositoryInterface,
      (container) =>
        new DocumentRepository(
          container.get(CoreServices.DatabaseContextInterface),
        ),
    )
  }
}
```

Service providers register command handlers, event listeners, repositories,
domain services, and controllers. The framework iterates through providers in
order, calling registration methods to populate the container. This makes
adding new modules as simple as creating a provider and adding it to the
registry.

The container uses symbol-based injection tokens instead of string identifiers.
This provides compile-time safety and enables IDE refactoring support. Invalid
dependencies get caught at container compilation time rather than at runtime
when services get invoked.

## Developer Experience

The development setup includes hot reload through tsx watch mode, enabling
rapid iteration without manual restarts. The logger outputs structured JSON in
production and human-readable format in development, making local debugging
straightforward.

Code quality checks run through a single npm script that verifies TypeScript
compilation, dependency rules, and test execution. This makes the feedback loop
fast and catches issues before code review.

```bash
npm run check
npm test
```

The migration system provides commands for applying and reverting database
changes, making schema evolution manageable. Migrations run before starting the
development server to ensure the database schema matches code expectations.

Environment configuration uses a [.env.defaults](.env.defaults) file for
development defaults and `.env` for local overrides that don't get committed.
This eliminates the need for developers to manually configure every environment
variable while allowing customization when needed.

`docker compose` provides the development database, eliminating manual MariaDB
installation. One command starts the database with correct configuration,
making project setup fast for new developers.

## Production Deployment

The build process compiles TypeScript to JavaScript with source maps for
debugging production issues. The output follows ESM module format with proper
import/export handling for modern Node.js compatibility.

The application implements graceful shutdown that closes HTTP servers,
disconnects WebSocket clients, drains database connection pools, and completes
in-flight requests before exiting. This prevents data corruption when deploying
updates or scaling down instances.

The logger uses [pino](https://github.com/pinojs/pino) for structured logging
with minimal performance overhead. Log levels control verbosity, and JSON
output integrates with log aggregation systems like ELK or CloudWatch.

Error handling includes proper HTTP status codes, consistent error response
format, and detailed error logging with context. Database errors get logged
with query details for debugging while API responses hide internal details from
clients.

## Performance Characteristics

The command bus adds minimal overhead compared to direct service calls. The
main cost comes from transaction management, which happens in well-designed
applications anyway. Event dispatch happens synchronously after transaction
commit, adding latency proportional to listener count and listener execution
time.

Database connection pooling reuses connections across requests, avoiding
connection setup overhead on every operation. The pool size configuration
balances memory usage against concurrent request capacity.

The WebSocket implementation handles concurrent connections through Node.js
event loop, scaling to thousands of connections per process. The heartbeat
mechanism adds minimal overhead through periodic ping messages.

Test execution parallelizes across CPU cores through
[Jest](https://github.com/jestjs/jest) workers with isolated databases per
worker. This scales test execution nearly linearly with CPU count while
maintaining isolation.

## Technical Stack

The implementation builds on carefully selected dependencies that provide
production-grade functionality without unnecessary complexity.
[Express 5](https://github.com/expressjs/express) provides HTTP routing and
middleware with improved async support.
[InversifyJS](https://github.com/inversify/monorepo) handles dependency
injection with TypeScript-first design. MySQL2 delivers fast MySQL access
with promise APIs and connection pooling. Pino offers high-performance
structured logging. WS provides lightweight WebSocket support.
Argon2 implements secure password hashing.
[dotenv](https://github.com/motdotla/dotenv) manages environment configuration.

Development dependencies include Jest for testing with supertest for HTTP
request testing, tsx for TypeScript execution and hot reload,
dependency-cruiser for architecture enforcement, and TypeScript 5.8 for
cutting-edge type system features.

The framework requires Node.js 22 or higher to leverage modern JavaScript
features like top-level await and enhanced async context tracking. MariaDB or
MySQL provides the persistence layer with full ACID transaction support.

## Usage Modes

The framework supports three different usage patterns depending on project
needs. The template mode means forking the repository and evolving it
independently, giving full control over every aspect but requiring maintenance
of core infrastructure. The template plus package mode uses the directory
structure and module organization while importing core infrastructure like
command bus and event dispatcher as a package, balancing control and
maintenance. The package only mode imports hexpress as a library and builds
custom structure on top, suitable for teams with specific architectural
preferences who want transactionality and event handling without prescribed
structure.

See [USAGE.md](USAGE.md) for detailed explanations of each approach with code
examples and tradeoffs.

## Getting Started

Clone the repository and install dependencies through npm. Start the MariaDB
database container via docker compose with the provided defaults. Run database
migrations to create schema. Start the development server with hot reload
enabled.

```bash
git clone https://github.com/frantisekstanko/hexpress.git
cd hexpress
npm install
docker compose --env-file .env.defaults up -d
npm run migrate
npm run dev
```

The application starts on port 50001 with WebSocket server on port 50002. Test
the API by creating a user, authenticating, and creating documents through the
REST endpoints.

Before committing changes, run the check script to verify architecture rules,
type checking, and test suite. The build must pass all checks before merging.

```bash
npm run check
npm test
```

## Contributing

The project welcomes contributions that maintain architectural integrity and
code quality standards. Open issues for bugs, feature requests, or architecture
discussions. Submit pull requests with tests covering changes and documentation
updates where relevant. Ensure the check script passes before submitting.

## License

MIT
