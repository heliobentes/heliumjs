import { useCall } from "helium/client";
import { getTasks } from "helium/server";

export default function TasksPage() {
    const { data: tasks, call: fetchTasks } = useCall(getTasks);

    const fetchTasksViaHTTP = async () => {
        const response = await fetch("/api/get-tasks?status=open", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        console.log("HTTP Tasks:", data);
    };

    const fetchTasksViaRPC = async () => {
        const fetchedTasks = await fetchTasks({ status: "open" });
        console.log("RPC Tasks:", fetchedTasks);
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

            <p>Check the Network tab in your browser's developer tools to compare MCP vs HTTP requests.</p>
        </div>
    );
}
