import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Trophy,
  Target,
  Loader2,
  AlertCircle,
  Store,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

export function Team() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendedores, setVendedores] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Novos estados para o filtro de lojas (Apenas Admin)
  const [lojas, setLojas] = useState([]);
  const [filtroLoja, setFiltroLoja] = useState("");

  const isAdmin = user?.cargo === "ADMIN";

  // Trava de segurança para DISPOSITIVO
  if (user?.cargo === "DISPOSITIVO") {
    return <Navigate to="/registrarvenda" replace />;
  }

  // BUSCA AS LOJAS (Apenas se for Admin)
  useEffect(() => {
    if (isAdmin) {
      // Ajuste para a sua rota exata de listar lojas, caso seja diferente
      api
        .get("/api/core/lojas/") // ou "/api/management/lojas/" dependendo do seu backend
        .then((res) => setLojas(res.data.results || res.data))
        .catch((err) => console.error("Erro ao buscar lojas:", err));
    }
  }, [isAdmin]);

  // BUSCA A EQUIPE DE VENDEDORES
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError("");

        // Passa o ID da loja como query param se o Admin tiver selecionado uma
        const params = filtroLoja ? { params: { loja_id: filtroLoja } } : {};

        // O backend novo já faz o filtro de cargo e de loja automaticamente!
        const response = await api.get("/api/users/vendedores/", params);
        const listaVendedores = response.data.results || response.data;

        setVendedores(listaVendedores);

        // Seleciona o primeiro da lista automaticamente, se existir
        if (listaVendedores.length > 0) {
          setSelectedUser(listaVendedores[0]);
        } else {
          setSelectedUser(null);
        }
      } catch (err) {
        setError("Não foi possível carregar a equipe do servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [filtroLoja]); // A busca refaz automaticamente se o filtroLoja mudar

  // Filtro local pela barra de pesquisa
  const filteredTeam = vendedores.filter((v) =>
    `${v.first_name} ${v.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading && vendedores.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#4D7BAB]" size={48} />
        <p className="text-slate-500 font-medium">Carregando equipe...</p>
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
              {isAdmin
                ? "Gerenciamento global de colaboradores"
                : `Equipe da sua unidade`}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Filtro de Lojas: Exclusivo para ADMIN */}
          {isAdmin && (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 w-full sm:w-auto">
              <Store size={20} className="text-[#4D7BAB] ml-2" />
              <select
                className="outline-none bg-transparent font-bold text-slate-600 pr-4 w-full cursor-pointer"
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
              >
                <option value="">Todas as Lojas</option>
                {lojas.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="flex items-center gap-2 px-6 py-3 bg-[#4D7BAB] text-white rounded-2xl font-bold hover:bg-[#3a5d82] transition-all w-full md:w-auto justify-center">
            <UserPlus size={20} /> Novo Vendedor
          </button>
        </div>
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

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredTeam.length === 0 ? (
              <p className="text-center text-slate-400 mt-10">
                Nenhum vendedor encontrado.
              </p>
            ) : (
              filteredTeam.map((v) => (
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
                    className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${
                      selectedUser?.id === v.id
                        ? "bg-[#4D7BAB] text-white"
                        : "bg-slate-100 text-[#4D7BAB]"
                    }`}
                  >
                    {v.first_name?.[0]}
                  </div>
                  <div className="overflow-hidden">
                    <span
                      className={`block font-bold truncate ${selectedUser?.id === v.id ? "text-[#4D7BAB]" : "text-slate-700"}`}
                    >
                      {v.first_name} {v.last_name}
                    </span>
                    {/* Exibe o nome da loja abaixo do nome do vendedor se o backend enviar (opcional) */}
                    {v.loja_nome && isAdmin && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                        {v.loja_nome}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* LADO DIREITO: Painel Detalhado */}
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-blue-50 h-[600px] flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-[1.5rem] bg-[#4D7BAB] text-white flex items-center justify-center font-extrabold text-3xl flex-shrink-0">
                  {selectedUser.first_name?.[0]}
                </div>
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-800 uppercase tracking-tight">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Email: {selectedUser.email || "Não cadastrado"}
                  </p>
                </div>
              </div>

              {/* Métricas Individuais */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2">
                    <Store size={14} /> Unidade (Loja)
                  </span>
                  <p className="text-2xl font-extrabold text-slate-700 truncate">
                    {selectedUser.loja_nome || "Não Vinculado"}
                  </p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2">
                    <Target size={14} /> Cargo
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-500 uppercase">
                    {selectedUser.cargo}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 font-medium bg-slate-50/50">
                <div className="text-center space-y-2">
                  <Trophy size={32} className="mx-auto text-slate-300" />
                  <p>Métricas de performance em desenvolvimento.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Users
                size={64}
                strokeWidth={1}
                className="mb-4 text-slate-200"
              />
              <p>Nenhum vendedor selecionado ou cadastrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Team;
