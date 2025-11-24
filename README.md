# Helium Framework

Helium is a full-stack React framework designed for simplicity and type safety. It integrates a Vite-based client with a Node.js server, providing seamless RPC communication and file-based routing.

## Features

-   **Full-Stack Integration**: Client and server in one project.
-   **Type-Safe RPC**: Call server functions directly from the client with full type inference.
-   **File-Based Routing**: Intuitive routing based on the `src/pages` directory structure.
-   **Custom HTTP Handlers**: Define custom endpoints for webhooks or external APIs.
-   **Middleware Support**: Add server-side middleware for authentication, logging, etc.
-   **Vite Powered**: Fast development and optimized production builds.

## Getting Started

### Installation

To use Helium in your project, ensure you have the necessary dependencies:

```json
"dependencies": {
    "helium": "path/to/helium",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
},
"devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
}
```

### Scripts

Add the following scripts to your `package.json`:

```json
"scripts": {
    "dev": "helium dev",
    "build": "helium build",
    "start": "helium start"
}
```

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the client and server for production.
-   `npm run start`: Starts the production server.

## Project Structure

A typical Helium project looks like this:

```
src/
  pages/           # Client-side pages (File-based routing)
    index.tsx
    [id].tsx       # Dynamic routes
    _layout.tsx    # Root layout
  server/          # Server-side logic
    index.ts       # Server entry (optional)
    my-api.ts      # RPC methods
    _middleware.ts # Server middleware
  components/      # React components
```

## Core Concepts

### 1. RPC (Remote Procedure Calls)

Define server-side functions using `defineMethod` and call them from the client using `useCall` or `useFetch`.

**Server (`src/server/tasks.ts`):**

```typescript
import { defineMethod } from "helium/server";

export const getTasks = defineMethod(async (args: { status: string }) => {
    // Database logic here
    return [{ id: 1, name: "Task 1", status: args.status }];
});

export const createTask = defineMethod(async (args: { name: string }) => {
    // Create task logic
    return { id: 2, name: args.name };
});
```

**Client (`src/pages/index.tsx`):**

```tsx
import { useFetch, useCall } from "helium/client";
import { getTasks, createTask } from "../server/tasks";

export default function TasksPage() {
    // Fetch data (auto-runs on mount)
    const { data, isLoading } = useFetch(getTasks, { status: "open" });

    // Mutation (callable function)
    const { call: add, isCalling } = useCall(createTask, {
        invalidate: [getTasks] // Auto-refresh getTasks after success
    });

    return (
        <div>
            <button onClick={() => add({ name: "New Task" })}>
                {isCalling ? "Adding..." : "Add Task"}
            </button>
            {data?.map(task => <div key={task.id}>{task.name}</div>)}
        </div>
    );
}
```

### 2. Routing

Helium uses file-based routing in the `src/pages` directory.

-   `src/pages/index.tsx` -> `/`
-   `src/pages/about.tsx` -> `/about`
-   `src/pages/users/[id].tsx` -> `/users/123`
-   `src/pages/_layout.tsx` -> Wraps all pages.

**Link Component:**

```tsx
import { Link } from "helium/client";

<Link href="/about">Go to About</Link>
```

**Programmatic Navigation:**

```tsx
import { useRouter } from "helium/client";

const router = useRouter();
router.push("/login");
```

### 3. Custom HTTP Handlers

For webhooks or REST endpoints, use `defineHTTPRequest`.

**Server (`src/server/webhooks.ts`):**

```typescript
import { defineHTTPRequest } from "helium/server";

export const stripeWebhook = defineHTTPRequest("POST", "/webhooks/stripe", async (req, ctx) => {
    const body = await req.json();
    // Handle webhook
    return { received: true };
});
```

### 4. Middleware

You can define middleware to intercept requests.

**Server (`src/server/_middleware.ts`):**

```typescript
import { middleware } from "helium/server";

export default middleware(async (ctx, next) => {
    console.log("Request received");
    return next();
});
```

## CLI Reference

-   `helium dev`: Starts Vite in development mode.
-   `helium build`:
    1.  Builds the client using Vite.
    2.  Scans `src/server` for exports.
    3.  Bundles the server using esbuild.
-   `helium start`: Runs the bundled server (`dist/server.js`).