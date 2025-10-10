# Hexpress

Express-based TypeScript API following hexagonal architecture principles.

## Requirements

- Node.js >= 22.0.0
- MariaDB server

## Installation

```bash
npm install
```

### To start MariaDB with Docker

```bash
docker compose --env-file .env.defaults up
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Running

```bash
npm start
```

## Testing

```bash
npm test
npm run test:unit
npm run test:flow
npm run test:adapter
npm run test:coverage
```

## Database

```bash
npm run migrate
```

## Code Quality

```bash
npm run check
```

## Fixing code style

```bash
npm run fix
```

## License

MIT
