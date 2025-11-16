import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import ActivityFeed from "./pages/ActivityFeed"; // ⬅️ NUEVO
import { useUser } from "./context/UserContext";
import Layout from "./components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PÚBLICAS */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTEGIDAS */}
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

        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Layout>
                <Teams />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* NUEVA PÁGINA: FEED DE ACTIVIDAD */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <Layout>
                <ActivityFeed />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
