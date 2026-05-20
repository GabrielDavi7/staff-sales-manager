import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Save,
  X,
  KeyRound,
  ShieldCheck,
  Store,
  Users,
  ArrowLeft,
  Loader2,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto (já configurada com a baseURL)
import api from "../../api/axios";

export default function CriarUsuario({ onBack }) {
  const [loadingDados, setLoadingDados] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    senha: "",
    primeiro_nome: "",
    ultimo_nome: "",
    email: "",
    pin: "",
    cargo: "",
    loja: "",
    equipe: "", // Agora passará a ser opcional
  });

  const [cargosDisponiveis] = useState([
    { id: "ADMIN", nome: "Administrador" },
    { id: "SUPERVISOR", nome: "Supervisor" },
    { id: "VENDEDOR", nome: "Vendedor" },
    { id: "DISPOSITIVO", nome: "Dispositivo" },
  ]);

  const [lojasDisponiveis, setLojasDisponiveis] = useState([]);
  const [equipesDisponiveis, setEquipesDisponiveis] = useState([]);

  // 1. CARREGA AS LOJAS E EQUIPES REAIS DO BANCO DE DADOS
  useEffect(() => {
    const carregarEstrutura = async () => {
      try {
        setLoadingDados(true);
        const [resLojas, resEquipes] = await Promise.all([
          api.get("/api/admin/lojas/"),
          api.get("/api/admin/equipes/"),
        ]);

        const dadosLojas = resLojas.data?.results || resLojas.data;
        const dadosEquipes = resEquipes.data?.results || resEquipes.data;

        if (Array.isArray(dadosLojas)) {
          setLojasDisponiveis(dadosLojas.filter((l) => l.ativo === true));
        }
        if (Array.isArray(dadosEquipes)) {
          setEquipesDisponiveis(dadosEquipes.filter((e) => e.ativo === true));
        }
      } catch (err) {
        console.error(
          "Erro ao buscar dados estruturais para o formulário:",
          err,
        );
      } finally {
        setLoadingDados(false);
      }
    };

    carregarEstrutura();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. DISPARA O POST PARA O USERVIEWSET DO MANAGEMENT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Mapeia os campos tratando a 'equipe' como opcional (null se vazia)
    const payload = {
      username: formData.username,
      password: formData.senha,
      first_name: formData.primeiro_nome,
      last_name: formData.ultimo_nome,
      email: formData.email,
      pin: formData.pin,
      cargo: formData.cargo,
      loja: Number(formData.loja),
      // REQUISITO: Se não selecionou equipe, envia null de forma limpa para o Django
      equipe: formData.equipe ? Number(formData.equipe) : null,
    };

    try {
      await api.post("/api/admin/usuarios/", payload);
      alert(`Colaborador "${formData.primeiro_nome}" cadastrado com sucesso!`);
      onBack();
    } catch (err) {
      console.error(
        "Erro ao cadastrar usuário no Django:",
        err.response?.data || err.message,
      );
      alert(
        "Erro 400: Não foi possível salvar. Verifique se o username ou e-mail já estão em uso.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full relative z-10 animate-in slide-in-from-bottom duration-500">
      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
      >
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div className="p-4 bg-[#4D7BAB] rounded-2xl text-white shadow-lg shadow-[#4D7BAB]/30">
          <UserPlus size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Novo Colaborador
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Preencha os dados para registrar um acesso protegido ao sistema.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SESSÃO 1: Dados Pessoais */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#4D7BAB]"></span> Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Primeiro Nome
              </label>
              <input
                type="text"
                name="primeiro_nome"
                required
                disabled={submitting}
                value={formData.primeiro_nome}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D7BAB] transition-all disabled:opacity-50"
                placeholder="Ex: Gabriel"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Último Nome
              </label>
              <input
                type="text"
                name="ultimo_nome"
                required
                disabled={submitting}
                value={formData.ultimo_nome}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D7BAB] transition-all disabled:opacity-50"
                placeholder="Ex: Davi"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-300">
                E-mail Corporativo
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={submitting}
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D7BAB] transition-all disabled:opacity-50"
                placeholder="gabriel@joias.com"
              />
            </div>
          </div>
        </div>

        {/* SESSÃO 2: Credenciais */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#822659]"></span> Acesso ao Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                disabled={submitting}
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#822659] transition-all disabled:opacity-50"
                placeholder="gabriel.davi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Senha Inicial
              </label>
              <input
                type="password"
                name="senha"
                required
                disabled={submitting}
                value={formData.senha}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#822659] transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                PIN (PDV)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  name="pin"
                  maxLength="6"
                  required
                  disabled={submitting}
                  value={formData.pin}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#822659] transition-all tracking-widest font-mono disabled:opacity-50"
                  placeholder="1234"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SESSÃO 3: Alocação */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#3E5641]"></span> Alocação
            Estrutural
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Seletor Cargo */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#3E5641]" /> Cargo
              </label>
              <select
                name="cargo"
                required
                disabled={submitting}
                value={formData.cargo}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {cargosDisponiveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor Loja Dinâmico */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Store size={16} className="text-[#3E5641]" /> Loja
              </label>
              <select
                name="loja"
                required
                disabled={submitting || loadingDados}
                value={formData.loja}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  {loadingDados ? "Carregando unidades..." : "Selecione..."}
                </option>
                {lojasDisponiveis.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor Equipe Dinâmico e Opcional */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Users size={16} className="text-[#3E5641]" /> Equipe
              </label>
              <select
                name="equipe"
                disabled={submitting || loadingDados}
                value={formData.equipe}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {loadingDados
                    ? "Carregando times..."
                    : "Nenhuma equipe (Trabalha sem time)"}
                </option>
                {equipesDisponiveis.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
          >
            <X size={20} /> Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || loadingDados}
            className="px-8 py-3 bg-[#4D7BAB] hover:bg-[#3b628a] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#4D7BAB]/30 flex items-center gap-2 cursor-pointer border-none outline-none disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Processando...
              </>
            ) : (
              <>
                <Save size={20} /> Registrar Usuário
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
