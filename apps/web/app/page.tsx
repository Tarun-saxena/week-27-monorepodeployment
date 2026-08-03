"use client";

import { useEffect, useState } from "react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [serverTime, setServerTime] = useState("Connecting...");

  async function fetchTodos() {
    try {
      const res = await fetch("http://localhost:3001/todos");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function createTodo() {
    if (!title.trim()) return;

    await fetch("http://localhost:3001/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
      }),
    });

    setTitle("");
    fetchTodos();
  }

  useEffect(() => {
    fetchTodos();

    const ws = new WebSocket("ws://localhost:3002");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "time") {
        setServerTime(data.time);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "40px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Monorepo Todo Demo</h1>

      <h2>Server Time</h2>

      <p
        style={{
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {serverTime}
      </p>

      <hr />

      <h2>Create Todo</h2>

      <div
        style={{
          display: "flex",
          gap: 10,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter todo..."
          style={{
            flex: 1,
            padding: 10,
          }}
        />

        <button
          onClick={createTodo}
          style={{
            padding: "10px 20px",
          }}
        >
          Add
        </button>
      </div>

      <hr />

      <h2>Todos</h2>

      {todos.length === 0 && <p>No todos yet.</p>}

      {todos.map((todo) => (
        <div
          key={todo.id}
          style={{
            padding: 12,
            marginTop: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <strong>{todo.title}</strong>

          <div
            style={{
              marginTop: 5,
              color: "#666",
            }}
          >
            {todo.completed ? "✅ Completed" : "❌ Pending"}
          </div>
        </div>
      ))}
    </main>
  );
}

export const dynamic = "force-dynamic";
// export const revalidate = 60; // Revalidate every 60 seconds for static pages
