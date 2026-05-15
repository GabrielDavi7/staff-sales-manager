import React, { useState } from "react";
import {
  UserPlus,
  Save,
  X,
  KeyRound,
  ShieldCheck,
  Store,
  Users,
  ArrowLeft,
} from "lucide-react";

export default function CriarUsuario({ onBack }) {
  const [formData, setFormData] = useState({
    username: "",
    senha: "",
    primeiro_nome: "",
    ultimo_nome: "",
    email: "",
    pin: "",
    cargo: "",
    loja: "",
    equipe: "",
  });

  const [cargosDisponiveis] = useState([
    { id: "ADMIN", nome: "Administrador" },
    { id: "SUPERVISOR", nome: "Supervisor" },
    { id: "VENDEDOR", nome: "Vendedor" },
  ]);
  const [lojasDisponiveis] = useState([
    { id: 1, nome: "Loja Matriz - Centro" },
    { id: 2, nome: "Loja Filial - Shopping" },
  ]);
  const [equipesDisponiveis] = useState([
    { id: 1, nome: "Equipe Diamante" },
    { id: 2, nome: "Equipe Ouro" },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Novo Usuário cadastrado:", formData);
    alert("Usuário cadastrado com sucesso!");
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto w-full relative z-10 animate-in slide-in-from-bottom duration-500">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
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
            Preencha os dados para registrar um acesso ao sistema.
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
                value={formData.primeiro_nome}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D7BAB] transition-all"
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
                value={formData.ultimo_nome}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D7BAB] transition-all"
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
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D7BAB] transition-all"
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
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#822659] transition-all"
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
                value={formData.senha}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#822659] transition-all"
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
                  value={formData.pin}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#822659] transition-all tracking-widest font-mono"
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#3E5641]" /> Cargo
              </label>
              <select
                name="cargo"
                required
                value={formData.cargo}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer"
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Store size={16} className="text-[#3E5641]" /> Loja
              </label>
              <select
                name="loja"
                required
                value={formData.loja}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer"
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {lojasDisponiveis.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Users size={16} className="text-[#3E5641]" /> Equipe
              </label>
              <select
                name="equipe"
                required
                value={formData.equipe}
                onChange={handleChange}
                className="w-full bg-[#003847] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3E5641] cursor-pointer"
              >
                <option value="" disabled>
                  Selecione...
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

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} /> Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-[#4D7BAB] hover:bg-[#3b628a] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#4D7BAB]/30 flex items-center gap-2 cursor-pointer"
          >
            <Save size={20} /> Registrar Usuário
          </button>
        </div>
      </form>
    </div>
  );
}
