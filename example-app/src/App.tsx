import { useCall, useFetch } from "helium/client";
import { createTask, getTasks, removeTask } from "helium/server";
import { useEffect, useState } from "react";
import type { Task } from "./server/tasks/tasksStore";

export default function App() {
  const [taskName, setTaskName] = useState("");

  const { data: tasks, isLoading } = useFetch<{ status?: string }, Task[]>(
    getTasks,
    { status: "open" }
  );

  const { call: addTask, isCalling } = useCall(createTask, {
    invalidate: [getTasks],
  });

  const { call: deleteTask, isCalling: isRemoving } = useCall(removeTask, {
    invalidate: [getTasks],
  });

  useEffect(() => {
    setTaskName(`Task ${tasks?.length}`);
  }, [tasks]);

  return (
    <div style={{ padding: 20 }}>
      <h1>HeliumJS Example App</h1>

      <input
        type="text"
        placeholder="Task name"
        id="taskNameInput"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />

      <button onClick={() => addTask({ name: taskName })} disabled={isCalling}>
        Add Task
      </button>

      <ul>
        {tasks?.map((t: Task) => (
          <li key={t.id}>
            {t.name}{" "}
            <button
              onClick={() => deleteTask({ id: t.id })}
              disabled={isRemoving}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
