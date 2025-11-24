import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface HistItem {
  id: number;
  entidad: string;
  entidadNombre: string | null;
  accion: "CREAR" | "ACTUALIZAR" | "ELIMINAR";
  usuarioId: number | null;
  usuarioNombre: string | null;
  detalles: any;
  fecha: string;
}

// ----------- FORMATEADOR DE TIEMPO ----------
function timeAgo(date: string) {
  const diff = (new Date().getTime() - new Date(date).getTime()) / 1000;

  if (diff < 60) return "hace unos segundos";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return new Date(date).toLocaleDateString("es-AR");
}

export default function ActivityFeed() {
  const { user } = useUser();

  const [items, setItems] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });

  // ----------- FETCH ----------
  const fetchActivity = async () => {
    try {
      const res = await api.get("/historial", {
        params: { limit: 15, offset: (page - 1) * 15 },
      });

      const data = res.data;

      const list = data.items || data.data || [];
      const total = data.total || data.meta?.total || list.length;
      const totalPages = data.meta?.totalPages ?? Math.max(1, Math.ceil(total / 15));

      setItems(list);
      setMeta({ page, totalPages });
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [page]);

  // ----------- ICONOS ----------
  const icons: Record<string, string> = {
    CREAR: "🟢",
    ACTUALIZAR: "🟡",
    ELIMINAR: "🔴",
  };

  // ----------- TEXTO ----------
  const actionText = (accion: string, entidad: string, entidadNombre: string | null) => {
    const nombre = entidadNombre ?? entidad;

    switch (accion) {
      case "CREAR":
        return `creó ${nombre}`;
      case "ACTUALIZAR":
        return `modificó ${nombre}`;
      case "ELIMINAR":
        return `eliminó ${nombre}`;
      default:
        return "realizó una acción";
    }
  };

  // ----------- DETALLES ----------
  const renderDetails = (det: any) => {
    if (!det) return null;

    const before = det.antes;
    const after = det.despues;
    const nuevo = det.nuevo;

    if (nuevo) {
      return (
        <ul className="text-sm text-gray-700 space-y-1 mt-2">
          {Object.entries(nuevo).map(([k, v]) => (
            <li key={k}>
              <span className="font-semibold capitalize">{k}: </span>
              {String(v)}
            </li>
          ))}
        </ul>
      );
    }

    if (before && after) {
      return (
        <div className="mt-3 space-y-2">
          <p className="text-gray-700 font-semibold text-sm">Cambios:</p>
          <div className="border rounded-lg bg-gray-50 p-3 text-sm space-y-3">
            {Object.keys(after).map((key) => (
              <div key={key}>
                <p className="font-semibold capitalize">{key}:</p>
                <p className="text-gray-500 line-through">{before[key] ?? "—"}</p>
                <p className="text-gray-900">{after[key] ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  // ----------- LOADING ----------
  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando actividad...</p>;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h2 className="text-3xl font-semibold mb-6">Actividad reciente</h2>

      {items.length === 0 ? (
        <p className="text-center text-gray-600">No hay actividad registrada.</p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-5 bg-white border rounded-xl shadow-sm hover:shadow-lg transition"
            >
              {/* AVATAR */}
              <div className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-full font-semibold text-lg">
                {(item.usuarioNombre || `Usuario ${item.usuarioId}`)[0].toUpperCase()}
              </div>

              {/* CONTENIDO */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icons[item.accion]}</span>

                  <span className="font-medium text-gray-900">
                    {item.usuarioNombre
                      ? item.usuarioNombre
                      : `Usuario ${item.usuarioId}`}{" "}
                    {actionText(item.accion, item.entidad, item.entidadNombre)}
                  </span>
                </div>

                {renderDetails(item.detalles)}

                <p className="text-xs text-gray-400 mt-2">{timeAgo(item.fecha)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Anterior
        </button>

        <span className="text-gray-600 text-sm">
          Página {meta.page} de {meta.totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          disabled={page === meta.totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
