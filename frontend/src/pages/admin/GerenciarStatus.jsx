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
  X,
  Edit,
  Save,
  KeyRound,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto
import api from "../../api/axios";

export default function GerenciarStatus({ onBack }) {
  const [subAba, setSubAba] = useState("usuarios");
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);

  // Estados para modais
  const [itemConfirmacao, setItemConfirmacao] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Estados das entidades vindas da API
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [metricas, setMetricas] = useState([]);

  // Carregamento inicial do banco de dados
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

      setLojas(resLojas.data.results || resLojas.data || []);
      setMetricas(resMetricas.data.results || resMetricas.data || []);
      setUsuarios(resUsuarios.data.results || resUsuarios.data || []);
      setEquipes(resEquipes.data.results || resEquipes.data || []);
    } catch (error) {
      console.error("Erro ao buscar dados das entidades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosGerenciamento();
  }, []);

  // Dispara o PATCH de Status (Soft Delete)
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
      carregarDadosGerenciamento();
    } catch (error) {
      console.error(`Erro ao atualizar status de ${tipo}:`, error);
      alert("Erro na operação.");
    }
  };

  // Envia a Edição Completa de forma inteligente (Apenas campos modificados de fato)
  const handleSalvarEdicaoUsuario = async (e) => {
    e.preventDefault();
    setSavingUser(true);

    // Localiza o registro original vindo do banco antes da edição do formulário
    const usuarioOriginal = usuarios.find((u) => u.id === usuarioEditando.id);

    // Monta o payload base com os dados comuns
    const payload = {
      first_name: usuarioEditando.first_name,
      last_name: usuarioEditando.last_name,
      pin: usuarioEditando.pin,
      cargo: usuarioEditando.cargo,
      loja: usuarioEditando.loja ? Number(usuarioEditando.loja) : null,
      equipe: usuarioEditando.equipe ? Number(usuarioEditando.equipe) : null,
    };

    // ESTRATÉGIA DEFENSIVA: Só envia username/email se o admin realmente digitou algo diferente do original
    if (
      usuarioOriginal &&
      usuarioEditando.username !== usuarioOriginal.username
    ) {
      payload.username = usuarioEditando.username;
    }
    if (usuarioOriginal && usuarioEditando.email !== usuarioOriginal.email) {
      payload.email = usuarioEditando.email;
    }

    // Só insere password no payload se o admin digitou uma nova senha
    if (usuarioEditando.senha && usuarioEditando.senha.trim() !== "") {
      payload.password = usuarioEditando.senha;
    }

    try {
      await api.patch(`/api/admin/usuarios/${usuarioEditando.id}/`, payload);
      alert("Colaborador atualizado com sucesso!");
      setUsuarioEditando(null);
      carregarDadosGerenciamento();
    } catch (err) {
      console.error(
        "Erro detalhado retornado pelo Django:",
        err.response?.data || err.message,
      );

      // Dinamiza o alerta para exibir o erro exato do Django na tela, facilitando seu debug
      const detalheErro = err.response?.data
        ? JSON.stringify(err.response.data)
        : "Verifique os campos preenchidos ou a sua conexão.";
      alert(`Erro ao salvar alterações: ${detalheErro}`);
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleClick = (tipo, idField, idValue, statusAtual, nome) => {
    setItemConfirmacao({ tipo, idField, idValue, statusAtual, nome });
  };

  const confirmarAlteracaoStatus = () => {
    if (itemConfirmacao) {
      toggleStatusAPI(
        itemConfirmacao.tipo,
        itemConfirmacao.idField,
        itemConfirmacao.idValue,
        itemConfirmacao.statusAtual,
      );
      setItemConfirmacao(null);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) => u.cargo?.toUpperCase() !== "ADMIN",
  );

  if (loading && usuarios.length === 0) {
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
            Gerencie e edite acessos, filiais, grupos e indicadores em tempo
            real.
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
                    {u.first_name} {u.last_name}
                  </h4>
                  <p className="text-sm text-slate-400">
                    @{u.username} •{" "}
                    <span className="text-xs bg-[#822659]/30 text-rose-300 font-bold px-2 py-0.5 rounded uppercase">
                      {u.cargo}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    // CORREÇÃO E EXTRAÇÃO EXPLICÍTICA DE IDS CASO SEJAM RETORNADOS COMO OBJETOS ANINHADOS
                    onClick={() =>
                      setUsuarioEditando({
                        ...u,
                        loja: u.loja?.id || u.loja || "",
                        equipe: u.equipe?.id || u.equipe || "",
                        senha: "",
                      })
                    }
                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all border-none cursor-pointer flex"
                    title="Editar Usuário"
                  >
                    <Edit size={18} />
                  </button>
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
              </div>
            ))}
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
                  <p className="text-sm text-slate-400">ID Loja: {e.loja}</p>
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
                  <p className="text-sm text-slate-400">{m.descricao}</p>
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
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO INTEGRAL DE USUÁRIO */}
      {usuarioEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSalvarEdicaoUsuario}
            className="bg-[#003847] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl p-8 space-y-6 text-white max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Edit size={22} className="text-rose-400" /> Alterar Ficha
                Cadastral
              </h3>
              <button
                type="button"
                onClick={() => setUsuarioEditando(null)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primeiro Nome */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Primeiro Nome
                </label>
                <input
                  type="text"
                  value={usuarioEditando.first_name || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      first_name: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Último Nome */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Último Nome
                </label>
                <input
                  type="text"
                  value={usuarioEditando.last_name || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      last_name: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* E-mail Corporativo */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  value={usuarioEditando.email || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      email: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Username de Acesso
                </label>
                <input
                  type="text"
                  value={usuarioEditando.username || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      username: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Redefinição Opcional de Senha */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={usuarioEditando.senha || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      senha: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  placeholder="Deixe vazio p/ não alterar"
                />
              </div>

              {/* PIN do PDV */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                  <KeyRound size={12} /> PIN (6 Dígitos)
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={usuarioEditando.pin || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      pin: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono tracking-widest focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Cargo Nível */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Cargo Corporativo
                </label>
                <select
                  value={usuarioEditando.cargo || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      cargo: e.target.value,
                    })
                  }
                  className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="VENDEDOR">Vendedor</option>
                </select>
              </div>

              {/* Loja Vinculada */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Loja Alocada
                </label>
                <select
                  value={usuarioEditando.loja || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      loja: e.target.value,
                    })
                  }
                  className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  required
                >
                  {lojas.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipe Comercial Opcional */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Equipe Comercial (Opcional)
                </label>
                <select
                  value={usuarioEditando.equipe || ""}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      equipe: e.target.value,
                    })
                  }
                  className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                >
                  <option value="">Nenhuma equipe (Sem time alocado)</option>
                  {equipes.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setUsuarioEditando(null)}
                className="px-5 py-2.5 bg-white/5 text-slate-300 rounded-xl font-bold border-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingUser}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold border-none cursor-pointer flex items-center gap-2"
              >
                {savingUser ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}{" "}
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE STATUS (ATIVAR / DESATIVAR) */}
      {itemConfirmacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#003847] border border-white/10 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => setItemConfirmacao(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border-none cursor-pointer"
            >
              <X size={18} />
            </button>
            <div
              className={`flex items-center gap-3 mb-4 ${itemConfirmacao.statusAtual ? "text-rose-400" : "text-emerald-400"}`}
            >
              <h3 className="text-xl font-black text-white">
                Confirmar Operação
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Você tem certeza de que deseja{" "}
              {itemConfirmacao.statusAtual ? "desativar" : "ativar"} a entidade{" "}
              <strong>"{itemConfirmacao.nome}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemConfirmacao(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-300 bg-white/5 border-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAlteracaoStatus}
                className={`px-5 py-2.5 text-white rounded-xl font-bold border-none cursor-pointer ${itemConfirmacao.statusAtual ? "bg-rose-600" : "bg-emerald-600"}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
