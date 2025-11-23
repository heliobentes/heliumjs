import { useCall } from "helium/client";
import { getTasks } from "helium/server";

export default function TasksPage() {
    const { data: tasks, call: fetchTasks } = useCall(getTasks);

    async function measure(name: string, fn: () => Promise<any>) {
        const iterations = 200;
        const results: number[] = [];
        let lastSize = 0;

        // warm up
        await fn();

        for (let i = 0; i < iterations; i++) {
            const t0 = performance.now();
            const res = await fn();
            const t1 = performance.now();
            results.push(t1 - t0);

            // approximate JSON size when applicable
            try {
                const json = JSON.stringify(res);
                lastSize = new Blob([json]).size;
            } catch {
                lastSize = 0;
            }
        }

        const avg = results.reduce((a, b) => a + b, 0) / results.length;
        console.log(`${name} — avg: ${avg.toFixed(3)} ms (n=${iterations}), last payload size: ${lastSize} bytes`);
    }

    const fetchTasksViaHTTP = async () => {
        const response = await fetch("/api/get-tasks?status=open", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        return await response.json();
    };

    const fetchTasksViaRPC = async () => {
        return await fetchTasks({ status: "open" });
    };

    const runComparison = async () => {
        await measure("RPC", fetchTasksViaRPC);
        await measure("HTTP", fetchTasksViaHTTP);
    };

    return (
        <div>
            <h1 className="text-lg font-bold mb-4">Compare RPC vs HTTP</h1>

            <button onClick={fetchTasksViaRPC} className="button primary">
                Fetch via RPC
            </button>

            <button onClick={fetchTasksViaHTTP} className="button primary">
                Fetch via HTTP
            </button>

            <button onClick={runComparison} className="button secondary">
                Run detailed benchmark (200 runs)
            </button>

            <p>Check the Network tab and console for detailed timing + payload size.</p>
        </div>
    );
}
