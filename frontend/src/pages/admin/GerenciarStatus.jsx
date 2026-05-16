import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Users,
  Store,
  Target,
  Component,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto
import api from "../../api/axios";

export default function GerenciarStatus({ onBack }) {
  const [subAba, setSubAba] = useState("usuarios");
  const [loading, setLoading] = useState(true);

  // Estado para controlar o item que o Admin clicou para alterar o status (ativar/desativar)
  const [itemConfirmacao, setItemConfirmacao] = useState(null);

  // Estados das entidades vindas da API
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [metricas, setMetricas] = useState([]);

  // Carregamento inicial do banco de dados
  useEffect(() => {
    const carregarDadosGerenciamento = async () => {
      try {
        setLoading(true);
        const [resLojas, resMetricas, resUsuarios, resEquipes] =
          await Promise.all([
            api.get("/api/admin/lojas/"),
            api.get("/api/admin/metricas/"),
            api.get("/api/admin/usuarios/"),
            api.get("/api/admin/equipes/"),
          ]);

        setLojas(resLojas.data.results || resLojas.data);
        setMetricas(resMetricas.data.results || resMetricas.data);
        setUsuarios(resUsuarios.data.results || resUsuarios.data);
        setEquipes(resEquipes.data.results || resEquipes.data);
      } catch (error) {
        console.error("Erro ao buscar dados das entidades:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosGerenciamento();
  }, []);

  // Dispara o PATCH real para o Django
  const toggleStatusAPI = async (tipo, idField, idValue, statusAtual) => {
    let endpoint = "";
    let payload = {};

    if (tipo === "usuarios") {
      endpoint = `/api/admin/usuarios/${idValue}/`;
      payload = { is_active: !statusAtual };
    } else {
      endpoint = `/api/admin/${tipo}/${idValue}/`;
      payload = { ativo: !statusAtual };
    }

    try {
      await api.patch(endpoint, payload);

      // Atualização síncrona do estado no React
      if (tipo === "usuarios") {
        setUsuarios((prev) =>
          prev.map((u) =>
            u[idField] === idValue ? { ...u, is_active: !statusAtual } : u,
          ),
        );
      } else if (tipo === "lojas") {
        setLojas((prev) =>
          prev.map((l) =>
            l[idField] === idValue ? { ...l, ativo: !statusAtual } : l,
          ),
        );
      } else if (tipo === "equipes") {
        setEquipes((prev) =>
          prev.map((e) =>
            e[idField] === idValue ? { ...e, ativo: !statusAtual } : e,
          ),
        );
      } else if (tipo === "metricas") {
        setMetricas((prev) =>
          prev.map((m) =>
            m[idField] === idValue ? { ...m, ativo: !statusAtual } : m,
          ),
        );
      }
    } catch (error) {
      console.error(`Erro ao atualizar status de ${tipo}:`, error);
      alert(
        "Erro na operação. Verifique se existem dependências ativas ou permissões de ADMIN.",
      );
    }
  };

  // Interceptador de clique: Abre o modal de confirmação tanto para ATIVAR quanto para DESATIVAR
  const handleToggleClick = (tipo, idField, idValue, statusAtual, nome) => {
    setItemConfirmacao({ tipo, idField, idValue, statusAtual, nome });
  };

  // Executa após o Admin confirmar a ação dentro do Modal
  const confirmarAlteracaoStatus = () => {
    if (itemConfirmacao) {
      toggleStatusAPI(
        itemConfirmacao.tipo,
        itemConfirmacao.idField,
        itemConfirmacao.idValue,
        itemConfirmacao.statusAtual,
      );
      setItemConfirmacao(null); // Fecha o modal
    }
  };

  // Filtra as contas de ADM para que elas fiquem invisíveis e protegidas na listagem
  const usuariosFiltrados = usuarios.filter(
    (u) => u.cargo?.toUpperCase() !== "ADMIN",
  );

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="animate-spin text-[#822659]" size={48} />
        <p className="text-slate-300 font-medium">
          Sincronizando dados com o servidor...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full relative z-10 animate-in slide-in-from-bottom duration-500">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none outline-none"
      >
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div className="p-4 bg-[#822659] rounded-2xl text-white shadow-lg shadow-[#822659]/30">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Gerenciamento de Status
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie a ativação de acessos, filiais, grupos e indicadores.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-[#003847]/40 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setSubAba("usuarios")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "usuarios" ? "bg-[#822659] text-white" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Users size={16} /> Usuários
        </button>
        <button
          onClick={() => setSubAba("lojas")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "lojas" ? "bg-[#822659] text-white" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Store size={16} /> Lojas
        </button>
        <button
          onClick={() => setSubAba("equipes")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "equipes" ? "bg-[#822659] text-white" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Component size={16} /> Equipes
        </button>
        <button
          onClick={() => setSubAba("metricas")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "metricas" ? "bg-[#822659] text-white" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Target size={16} /> Métricas
        </button>
      </div>

      {/* Conteúdo das tabelas */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-xl backdrop-blur-md">
        {/* Tabela Usuários */}
        {subAba === "usuarios" && (
          <div className="space-y-4">
            {usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div>
                  <h4 className="font-bold text-white text-lg">
                    {u.first_name || u.last_name
                      ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                      : u.username}
                  </h4>
                  <p className="text-sm text-slate-400">
                    @{u.username} •{" "}
                    <span className="text-xs bg-[#822659]/30 text-rose-300 font-bold px-2 py-0.5 rounded uppercase">
                      {u.cargo}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleClick(
                      "usuarios",
                      "id",
                      u.id,
                      u.is_active,
                      u.username,
                    )
                  }
                  className="bg-transparent border-none cursor-pointer outline-none"
                >
                  {u.is_active ? (
                    <ToggleRight size={44} className="text-[#a8d3b2]" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-500" />
                  )}
                </button>
              </div>
            ))}
            {usuariosFiltrados.length === 0 && (
              <p className="text-center text-slate-400 py-4">
                Nenhum funcionário operacional registrado.
              </p>
            )}
          </div>
        )}

        {/* Tabela Lojas */}
        {subAba === "lojas" && (
          <div className="space-y-4">
            {lojas.map((l) => (
              <div
                key={l.id}
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div>
                  <h4 className="font-bold text-white text-lg">{l.nome}</h4>
                  <p className="text-sm text-slate-400">{l.cidade}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleClick("lojas", "id", l.id, l.ativo, l.nome)
                  }
                  className="bg-transparent border-none cursor-pointer outline-none"
                >
                  {l.ativo ? (
                    <ToggleRight size={44} className="text-[#a8d3b2]" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-500" />
                  )}
                </button>
              </div>
            ))}
            {lojas.length === 0 && (
              <p className="text-center text-slate-400 py-4">
                Nenhuma loja registrada.
              </p>
            )}
          </div>
        )}

        {/* Tabela Equipes */}
        {subAba === "equipes" && (
          <div className="space-y-4">
            {equipes.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div>
                  <h4 className="font-bold text-white text-lg">{e.nome}</h4>
                  <p className="text-sm text-slate-400">
                    Vínculo: Unidade ID {e.loja}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleClick("equipes", "id", e.id, e.ativo, e.nome)
                  }
                  className="bg-transparent border-none cursor-pointer outline-none"
                >
                  {e.ativo ? (
                    <ToggleRight size={44} className="text-[#a8d3b2]" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-500" />
                  )}
                </button>
              </div>
            ))}
            {equipes.length === 0 && (
              <p className="text-center text-slate-400 py-4">
                Nenhuma equipe registrada.
              </p>
            )}
          </div>
        )}

        {/* Tabela Métricas */}
        {subAba === "metricas" && (
          <div className="space-y-4">
            {metricas.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div>
                  <h4 className="font-bold text-white text-lg">{m.nome}</h4>
                  <p className="text-sm text-slate-400">
                    {m.descricao || "Sem descrição disponível."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleClick("metricas", "id", m.id, m.ativo, m.nome)
                  }
                  className="bg-transparent border-none cursor-pointer outline-none"
                >
                  {m.ativo ? (
                    <ToggleRight size={44} className="text-[#a8d3b2]" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-500" />
                  )}
                </button>
              </div>
            ))}
            {metricas.length === 0 && (
              <p className="text-center text-slate-400 py-4">
                Nenhuma métrica registrada.
              </p>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO EXECUTIVA (ATIVAR / DESATIVAR) */}
      {itemConfirmacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#003847] border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setItemConfirmacao(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-xl border-none cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho do modal adaptivo ao tipo de ação */}
            <div
              className={`flex items-center gap-3 mb-4 ${itemConfirmacao.statusAtual ? "text-rose-400" : "text-emerald-400"}`}
            >
              <div
                className={`p-3 rounded-xl ${itemConfirmacao.statusAtual ? "bg-rose-500/10" : "bg-emerald-500/10"}`}
              >
                {itemConfirmacao.statusAtual ? (
                  <AlertTriangle size={24} />
                ) : (
                  <CheckCircle size={24} />
                )}
              </div>
              <h3 className="text-xl font-black text-white">
                Confirmar Operação
              </h3>
            </div>

            {/* Descrição dinâmica baseada no estado atual */}
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Você tem certeza de que deseja{" "}
              <strong
                className={
                  itemConfirmacao.statusAtual
                    ? "text-rose-300"
                    : "text-emerald-300"
                }
              >
                {itemConfirmacao.statusAtual ? "desativar" : "ativar"}
              </strong>{" "}
              a entidade{" "}
              <strong className="text-white">"{itemConfirmacao.nome}"</strong>?
              {itemConfirmacao.statusAtual
                ? " Isso impedirá imediatamente novos registros vinculados a ela no ecossistema."
                : " Isso liberará o uso imediato e seleções dela no banco de dados e PDVs."}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemConfirmacao(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAlteracaoStatus}
                className={`px-5 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all cursor-pointer border-none ${
                  itemConfirmacao.statusAtual
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                }`}
              >
                Confirmar{" "}
                {itemConfirmacao.statusAtual ? "Desativação" : "Ativação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
