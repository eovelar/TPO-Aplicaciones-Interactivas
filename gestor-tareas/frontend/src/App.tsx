import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import { useUser } from "./context/UserContext";
import Layout from "./components/Layout";
import React from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  return <>{user ? children : <Navigate to="/" replace />}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas con Layout */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
