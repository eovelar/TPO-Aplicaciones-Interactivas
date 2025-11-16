import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface HistItem {
  id: number;
  entidad: string;
  accion: "CREAR" | "ACTUALIZAR" | "ELIMINAR";
  usuarioId: number;
  detalles: any;
  createdAt: string;
}

export default function ActivityFeed() {
  const { user } = useUser();
  const [items, setItems] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
  });

  const fetchActivity = async () => {
    try {
      const res = await api.get("/historial", {
        headers: {
          "x-user-id": String(user?.id),
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
        params: { page, limit: 10 },
      });

      setItems(res.data.data || []);
      setMeta(res.data.meta || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [page]);

  const groupByDate = (list: HistItem[]) => {
    const groups: Record<string, HistItem[]> = {};

    list.forEach((item) => {
      const date = new Date(item.createdAt).toLocaleDateString("es-AR");
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    return groups;
  };

  const grouped = groupByDate(items);

  const getIcon = (accion: string) => {
    switch (accion) {
      case "CREAR":
        return "🟢";
      case "ACTUALIZAR":
        return "🟡";
      case "ELIMINAR":
        return "🔴";
      default:
        return "⚪";
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando actividad...</p>;

  return (
    <div className="max-w-4xl mx-auto">

      <h2 className="text-2xl font-semibold mb-4">Actividad reciente</h2>
      <hr className="mb-6" />

      {items.length === 0 ? (
        <p className="text-center text-gray-600">No hay actividad registrada.</p>
      ) : (
        <div className="space-y-10">

          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">{date}</h3>

              <div className="space-y-3 border-l-2 border-gray-300 pl-4">
                {entries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start gap-3 bg-white p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition"
                  >
                    <div className="text-xl">{getIcon(e.accion)}</div>

                    <div>
                      <p className="font-medium text-gray-800">
                        {e.accion === "CREAR" && "Se creó una tarea"}
                        {e.accion === "ACTUALIZAR" && "Se modificó una tarea"}
                        {e.accion === "ELIMINAR" && "Se eliminó una tarea"}
                      </p>

                      <p className="text-gray-500 text-sm">
                        Usuario ID: {e.usuarioId}
                      </p>

                      {e.detalles?.title && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Título:</span> {e.detalles.title}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(e.createdAt).toLocaleTimeString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-gray-600 text-sm">
          Página {meta.page} de {meta.totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
          disabled={page === meta.totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
