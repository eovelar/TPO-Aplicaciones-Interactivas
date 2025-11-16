import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface Historial {
  id: number;
  entidad: string;
  accion: string;
  usuarioId: number;
  detalles: any;
  createdAt: string;
  usuario?: {
    id: number;
    name: string;
  };
}

export default function ActivityFeed() {
  const { user } = useUser();
  const [items, setItems] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchFeed = async () => {
    try {
      const res = await api.get("/api/historial", {
        headers: {
          "x-user-id": String(user?.id),
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
        params: { page, limit: 10 },
      });

      setItems(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Error cargando actividad:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFeed();
  }, [page]);

  if (loading) return <p className="text-center mt-10">Cargando actividad...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Actividad reciente</h1>

      <div className="bg-white border rounded-lg shadow-sm divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-4">
            <p className="font-medium text-gray-800">
              {item.entidad.toUpperCase()} – {item.accion}
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Usuario: {item.usuario?.name || item.usuarioId}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Fecha: {new Date(item.createdAt).toLocaleString()}
            </p>

            {item.detalles && (
              <pre className="bg-gray-100 text-xs p-2 rounded mt-2">
                {JSON.stringify(item.detalles, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-center mt-6 gap-3">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-gray-600">
          Página {meta.page} de {meta.totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
          disabled={page === meta.totalPages}
          className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
