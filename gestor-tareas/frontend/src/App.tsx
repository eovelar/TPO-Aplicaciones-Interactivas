import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import { useUser } from "./context/UserContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <header className="bg-blue-600 text-white py-4 shadow">
          <h1 className="text-center text-2xl font-semibold">
            🧩 Gestor de Tareas
          </h1>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
