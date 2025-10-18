# hexpress Usage Guide

hexpress is both a **GitHub template** and an **npm package**,
giving you flexibility in how you use it.

## Usage Patterns

### Pattern A: Full Template (Fork & Forget)

Clone the entire project and evolve it independently:

```bash
git clone https://github.com/frantisekstanko/hexpress my-project
cd my-project
npm install
npm run dev
```

**When to use:**
- You want full control over infrastructure
- You plan to heavily customize the core
- You don't need updates from `hexpress`

### Pattern B: Template + Package (Stay Connected)

Use the template structure, but consume dependencies:

```bash
git clone https://github.com/frantisekstanko/hexpress my-project
cd my-project

rm -rf src/Core

npm install hexpress
```

Then just replace all `'@/Core/'` with `'hexpress/Core/` in the codebase.

A programmatical way to do this:

```bash
find . -type f -name "*.ts" | xargs sed -i "s|@/Core/|hexpress/Core/|g"
```

**When to use:**
- You want infrastructure updates via npm
- Standard backend needs
- Working in a larger organization with multiple projects sharing the same setup

### Pattern C: Package Only (Minimal Setup)

Start fresh, install only what you need:

```bash
mkdir my-project && cd my-project
npm init -y
npm install hexpress
```

Build your own structure using hexpress infrastructure.

---

## Updating hexpress

### Pattern A (Template)
No automatic updates. Cherry-pick changes from hexpress repo manually.

### Pattern B (Package)
```bash
npm update hexpress
```

Check breaking changes in the [CHANGELOG](./CHANGELOG.md).

---

## Example namespaces

See `src/Document/` for reference implementations following hexagonal architecture:
- Domain layer: Entities, value objects, domain events
- Application layer: Services, repositories (interfaces), commands
- Infrastructure layer: Concrete implementations, controllers, routes
