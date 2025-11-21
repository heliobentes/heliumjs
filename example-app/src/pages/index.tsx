export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold my-4">Welcome to HeliumJS</h1>
      <p className="mb-4 text-gray-600">
        A small and opinionated framework for building full-stack React
        applications
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>File-based RPC framework: no REST, no fetch, no API routes</li>
        <li>Server functions live in src/server and are auto-scanned</li>
        <li>
          Pages live in src/pages and are file-based routes (NextJS page route
          style)
        </li>
        <li>
          Client imports server functions via virtual modules (helium/server)
        </li>
        <li>Communication happens over a persistent WebSocket RPC protocol</li>
        <li>
          Two hooks: useFetch (reactive reads) and useCall (imperative writes)
        </li>

        <li>
          Simple mental model: write a server function → import on client → call
          it
        </li>
      </ul>
    </div>
  );
}
