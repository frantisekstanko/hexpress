# hexpress Usage Guide

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
- You don't need updates from hexpress

**Tradeoffs:**

| Pros | Cons |
|------|------|
| Full control over every line of code | No automatic updates from upstream |
| Can modify core infrastructure freely | You maintain everything yourself |
| No version conflicts with hexpress | Bug fixes must be applied manually |
| Simpler dependency tree | May diverge significantly over time |

**Best for:** Teams building a single product who want to own their infrastructure
completely, or projects with unique requirements that will diverge from standard
patterns.

---

### Pattern B: Template + Package (Stay Connected)

Use the template structure, but consume core infrastructure as a package:

```bash
git clone https://github.com/frantisekstanko/hexpress my-project
cd my-project

rm -rf src/Core

npm install https://github.com/frantisekstanko/hexpress#master
```

Then replace all `'@/Core/'` imports with `'hexpress/Core/'` in the codebase:

```bash
find . -type f -name "*.ts" | xargs sed -i "s|@/Core/|hexpress/Core/|g"
```

**When to use:**

- You want infrastructure updates from upstream
- Standard backend needs without heavy customization
- Multiple projects in your organization sharing the same foundation

**Tradeoffs:**

| Pros | Cons |
|------|------|
| Receive bug fixes and improvements automatically | Core infrastructure is read-only |
| Consistent foundation across multiple projects | Updates may introduce breaking changes |
| Less code to maintain | Must wait for upstream fixes |
| Clear separation between your code and framework | Slightly more complex setup |

**Best for:** Organizations with multiple backend services that want consistency
and reduced maintenance burden across projects.

---

### Pattern C: Package Only (Minimal Setup)

Start fresh, install only what you need:

```bash
mkdir my-project && cd my-project
npm init -y
npm install https://github.com/frantisekstanko/hexpress#master
```

Build your own structure using hexpress infrastructure.

**When to use:**

- You have specific architectural preferences
- You only need certain components (command bus, event dispatcher, etc.)
- You want to integrate hexpress into an existing project

**Tradeoffs:**

| Pros | Cons |
|------|------|
| Use only what you need | No reference implementation to follow |
| Integrate into existing projects | Must understand hexpress internals |
| Maximum flexibility in project structure | More initial setup work |
| Smallest footprint | Less guidance for team members |

**Best for:** Experienced teams who want transactionality and event handling
without adopting the full hexagonal structure, or when integrating into an
existing codebase.

---

## Comparison Matrix

| Aspect | Pattern A | Pattern B | Pattern C |
|--------|-----------|-----------|-----------|
| Setup complexity | Low | Medium | High |
| Maintenance burden | High | Low | Medium |
| Flexibility | Maximum | Moderate | Maximum |
| Upstream updates | Manual | Automatic | Automatic |
| Learning curve | Low | Low | High |
| Team onboarding | Easy | Easy | Harder |

---

## Updating hexpress

### Pattern A (Template)

No automatic updates. Cherry-pick changes from hexpress repo manually:

```bash
git remote add upstream https://github.com/frantisekstanko/hexpress
git fetch upstream
git cherry-pick <commit-hash>
```

### Patterns B & C (Package)

```bash
npm update hexpress
```

---

## Example Namespaces

See `src/Document/` for reference implementations following hexagonal
architecture:

- **Domain layer:** Entities, value objects, domain events
- **Application layer:** Services, repositories (interfaces), commands
- **Infrastructure layer:** Concrete implementations, controllers, routes

See `src/User/` for authentication patterns including JWT tokens, password
hashing, and refresh token management.
