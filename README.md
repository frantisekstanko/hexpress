# hexpress

[![npm version](https://img.shields.io/npm/v/hexpress.svg)](https://www.npmjs.com/package/hexpress)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)

A TypeScript backend template that respects hexagonal architecture.

Not another Express boilerplate with controllers calling services.
This one has **command buses**, **domain events**, **transaction management**,
and **dependency injection** baked in from day one.

## Why hexpress?

Most Express templates give you routes and controllers. We give you architecture.

**Command Bus Pattern**: Your HTTP layer sends commands. Your application
layer handles them. Clean separation. Every command execution wrapped in a
database transaction automatically.

**Event-Driven**: Domain aggregates record events. Event dispatcher fans
them out to listeners. Failed events get persisted for replay.
Your business logic stays pure.

**Proper Layering**: Each module organized into Domain/Application/Infrastructure.
Your domain doesn't know about Express. Your application layer doesn't know
about MySQL. Dependencies point inward.

**Type-Safe DI**: [InversifyJS](https://github.com/inversify/InversifyJS) with
symbols-based injection. No magic strings. No runtime surprises.

## What's Inside

- **Command Bus** with automatic transactionality
- **Event Dispatcher** with typed listeners and failure tracking
- **Repository Pattern** with interface-based abstraction
- **Transaction Management** with commit/rollback guards
- **Service Provider** pattern for modular setup
- Authentication with [argon2](https://github.com/ranisalt/node-argon2) hashing and JWT
- WebSocket support via [ws](https://github.com/websockets/ws)
- Structured logging with [pino](https://github.com/pinojs/pino)
- Type-safe assertions with [@frantisekstanko/assertion](https://github.com/frantisekstanko/assertion)

All running on Express 5, TypeScript 5.8, and Node.js 22+.

## Quick Start

```bash
npm install
docker compose --env-file .env.defaults up  # Start MariaDB
npm run migrate
npm run dev
```

## Usage

See [USAGE.md](./USAGE.md) for three different ways to use hexpress:
- **Template**: Fork and evolve independently
- **Template + Package**: Use the structure, import core infrastructure
- **Package Only**: Build your own structure with hexpress internals

## Architecture Highlights

### Commands Flow Through Layers

```typescript
// HTTP layer sends a command
const documentId = await commandBus.dispatch(
  new CreateDocument({ documentName: 'README.md', owner: userId })
)

// Application layer handles it
class CreateDocumentCommandHandler {
  async handle(command: CreateDocument): Promise<DocumentId> {
    return await this.documentService.createDocument(command)
  }
}

// Domain layer records events
class Document {
  static create({ id, name, owner }) {
    const document = new Document({ id, name, owner })
    document.recordEvent(new DocumentWasCreated({ id, name }))
    return document
  }
}

// Infrastructure dispatches events to listeners
class DocumentWasCreatedListener {
  whenDocumentWasCreated(event: DocumentWasCreated): void {
    this.webSocketServer.broadcast('update')
  }
}
```

Everything in a transaction. Rollback on failure.

### Directory Structure

```
src/
├── Core/               # Core infrastructure
│   ├── Domain/         # Value objects, interfaces
│   ├── Application/    # Command bus, event dispatcher, ports
│   └── Infrastructure/ # Database, transactions, DI container
├── Document/           # Example module
│   ├── Domain/         # Document aggregate, events
│   ├── Application/    # Commands, handlers, repositories
│   └── Infrastructure/ # Controllers, MySQL implementations
├── User/               # Another module
└── Authentication/     # Auth module
```

Each module is independent. Each layer has its own concerns. Your domain stays pure.

## Development

Run checks before committing:

```bash
npm run check
npm test
```

The architecture is enforced with
[dependency-cruiser](https://github.com/sverweij/dependency-cruiser).
Domain can't import from Infrastructure. Application can't import from
HTTP controllers. If you break the rules, the build fails.

## Requirements

- Node.js >= 22.0.0
- MariaDB server

## Building for Production

```bash
npm run build
npm start
```

## Contributing

Found a bug? Have an idea? Open an issue or PR. We're building the backend
template we wish existed when we started.

## License

MIT
