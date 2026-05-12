import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Trophy,
  Target,
  PieChart as PieChartIcon,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios"; // Garanta que este caminho está correto

export function Team() {
  // 1. CORREÇÃO: Pegar o user do useAuth para a trava de segurança funcionar
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendedores, setVendedores] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Trava de segurança para DISPOSITIVO
  if (user?.cargo === "DISPOSITIVO") {
    return <Navigate to="/registrarvenda" replace />;
  }

  // 2. BUSCA DE DADOS REAIS DO DOCKER
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        // Ajuste esta URL para a rota que lista usuários no seu Django
        const response = await api.get("/api/users/");

        // Filtramos para exibir apenas quem é VENDEDOR na lista da equipe
        const apenasVendedores = response.data.filter(
          (u) => u.cargo === "VENDEDOR",
        );

        setVendedores(apenasVendedores);
        if (apenasVendedores.length > 0) {
          setSelectedUser(apenasVendedores[0]);
        }
      } catch (err) {
        setError("Não foi possível carregar a equipe do servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const filteredTeam = vendedores.filter((v) =>
    `${v.first_name} ${v.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // 3. RENDERIZAÇÃO DE LOADING
  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#4D7BAB]" size={48} />
        <p className="text-slate-500 font-medium">Carregando equipe real...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#4D7BAB]/10 rounded-2xl text-[#4D7BAB]">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Equipe de Vendas
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dados reais vindos do sistema.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#4D7BAB] text-white rounded-2xl font-bold hover:bg-[#3a5d82] transition-all w-full md:w-auto justify-center">
          <UserPlus size={20} /> Novo Vendedor
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Layout Mestre-Detalhe */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LADO ESQUERDO: Lista de Funcionários */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50 flex flex-col h-[600px]">
          <div className="relative mb-6">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar vendedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#4D7BAB] transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredTeam.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedUser(v)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedUser?.id === v.id
                    ? "border-[#4D7BAB] bg-blue-50/50"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    selectedUser?.id === v.id
                      ? "bg-[#4D7BAB] text-white"
                      : "bg-slate-100 text-[#4D7BAB]"
                  }`}
                >
                  {v.first_name?.[0]}
                </div>
                <span
                  className={`font-bold ${selectedUser?.id === v.id ? "text-[#4D7BAB]" : "text-slate-700"}`}
                >
                  {v.first_name} {v.last_name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* LADO DIREITO: Painel Detalhado */}
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-blue-50 h-[600px] flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-[1.5rem] bg-[#4D7BAB] text-white flex items-center justify-center font-extrabold text-3xl">
                  {selectedUser.first_name?.[0]}
                </div>
                <h2 className="text-4xl font-extrabold text-slate-800 uppercase tracking-tight">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>
              </div>

              {/* Métricas Individuais (Aqui você linkaria com as métricas do Django futuramente) */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2">
                    <Trophy size={14} /> Performance
                  </span>
                  <p className="text-3xl font-extrabold text-[#4D7BAB]">
                    Ver no Dashboard
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2">
                    <Target size={14} /> Cargo
                  </span>
                  <p className="text-3xl font-extrabold text-emerald-500 uppercase">
                    {selectedUser.cargo}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-medium">
                Selecione o vendedor no dashboard para ver gráficos detalhados.
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Users size={64} strokeWidth={1} className="mb-4" />
              <p>Nenhum vendedor selecionado ou cadastrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
