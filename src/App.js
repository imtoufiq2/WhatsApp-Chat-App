"use client";

import React, { useState } from "react";
import { id, i, init } from "@instantdb/react";

// InstantDB App ID
const APP_ID = process.env.REACT_APP_APP_ID;
// Define schema for todos
const schema = i.schema({
  entities: {
    todos: i.entity({
      text: i.string(),
      done: i.boolean(),
      createdAt: i.number(),
    }),
  },
});

// Initialize InstantDB
const db = init({ appId: APP_ID, schema });

function App() {
  // Fetch todos from InstantDB
  const { isLoading, error, data } = db.useQuery({ todos: {} });

  const [newTodo, setNewTodo] = useState("");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const { todos } = data;

  // Add a new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    await db.transact(
      db.tx.todos[id()].update({
        text: newTodo,
        done: false,
        createdAt: Date.now(),
      })
    );
    setNewTodo("");
  };

  // Toggle a todo's completion status
  const toggleDone = async (todo) => {
    await db.transact(db.tx.todos[todo.id].update({ done: !todo.done }));
  };

  // Delete a todo
  const deleteTodo = async (todo) => {
    await db.transact(db.tx.todos[todo.id].delete());
  };

  // Delete all completed todos
  const deleteCompleted = async () => {
    debugger
    const completedTodos = todos.filter((todo) => todo.done);
    const txs = completedTodos.map((todo) => db.tx.todos[todo.id].delete());
    await db.transact(txs);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Todo App</h1>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          style={styles.input}
        />
        <button onClick={addTodo} style={styles.addButton}>
          Add
        </button>
      </div>
      <ul style={styles.todoList}>
        {todos.map((todo) => (
          <li key={todo.id} style={styles.todoItem}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleDone(todo)}
              style={styles.checkbox}
            />
            <span
              style={{
                ...styles.todoText,
                textDecoration: todo.done ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo)}
              style={styles.deleteButton}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button onClick={deleteCompleted} style={styles.clearButton}>
        Clear Completed
      </button>
    </div>
  );
}

// Styles
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  todoList: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #ccc",
  },
  checkbox: {
    marginRight: "10px",
  },
  todoText: {
    flexGrow: 1,
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ff0000",
    cursor: "pointer",
  },
  clearButton: {
    marginTop: "20px",
    padding: "10px",
    width: "100%",
    backgroundColor: "#FF6347",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default App;
