import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios";
import { Store, Users, Component, Target, AlertTriangle } from "lucide-react";

/**
 * Barra de indicadores de limite do plano.
 * Mostra uso atual vs limite contratado para lojas, usuarios e equipes.
 */
export default function LimitsBar() {
  const { user } = useAuth();
  const [contagens, setContagens] = useState(null);
  const [loading, setLoading] = useState(true);

  const planoLimites = user?.plano_limites;
  const planoNome = user?.plano_nome;

  useEffect(() => {
    if (!planoLimites) {
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      try {
        const [resLojas, resUsuarios, resEquipes] = await Promise.all([
          api.get("/api/admin/lojas/"),
          api.get("/api/admin/usuarios/"),
          api.get("/api/admin/equipes/"),
        ]);

        const contarAtivos = (response) => {
          const dados = response?.data?.results || response?.data;
          if (!Array.isArray(dados)) return 0;
          return dados.filter((item) => {
            if (item.ativo === false) return false;
            if (item.is_active === false) return false;
            return true;
          }).length;
        };

        setContagens({
          lojas: contarAtivos(resLojas),
          usuarios: contarAtivos(resUsuarios),
          equipes: contarAtivos(resEquipes),
        });
      } catch (err) {
        console.error("Erro ao carregar contagens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [planoLimites]);

  if (!planoLimites) return null;

  const items = [
    {
      label: "Lojas",
      atual: contagens?.lojas ?? "?",
      max: planoLimites.max_lojas,
      icon: Store,
      color: "bg-blue-500",
    },
    {
      label: "Usuários",
      atual: contagens?.usuarios ?? "?",
      max: planoLimites.max_usuarios_total,
      icon: Users,
      color: "bg-emerald-500",
    },
    {
      label: "Equipes",
      atual: contagens?.equipes ?? "?",
      max: planoLimites.max_equipes_por_loja,
      icon: Component,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Limites do Plano {planoNome}
        </h3>
        {loading && (
          <span className="text-xs text-slate-400 animate-pulse">
            Carregando...
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => {
          const pct =
            typeof item.atual === "number"
              ? Math.min((item.atual / item.max) * 100, 100)
              : 0;
          const atingido = pct >= 100;
          const quase = pct >= 80 && pct < 100;

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon size={16} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {item.label}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    atingido
                      ? "text-red-500"
                      : quase
                        ? "text-amber-500"
                        : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.atual}/{item.max}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    atingido
                      ? "bg-red-500"
                      : quase
                        ? "bg-amber-500"
                        : item.color
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {atingido && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertTriangle size={12} />
                  Limite atingido
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
