import React, { useState } from "react";
import {
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Users,
  Store,
  Target,
  Component,
  ShieldCheck,
} from "lucide-react";

export default function GerenciarStatus({ onBack }) {
  // Sub-abas internas para organizar as 4 categorias de forma limpa
  const [subAba, setSubAba] = useState("usuarios");

  // Dados Mockados com chaves 'ativo: true/false'
  const [usuarios, setUsuarios] = useState([
    {
      username: "gabriel.davi",
      nome: "Gabriel Davi",
      cargo: "ADMIN",
      ativo: true,
    },
    {
      username: "ana.sousa",
      nome: "Ana Sousa",
      cargo: "VENDEDOR",
      ativo: true,
    },
    {
      username: "tablet.totem",
      nome: "Tablet Balcão 01",
      cargo: "DISPOSITIVO",
      ativo: false,
    },
  ]);

  const [lojas, setLojas] = useState([
    {
      id: 1,
      nome: "Loja Matriz - Centro",
      cidade: "Montes Claros",
      ativo: true,
    },
    {
      id: 2,
      nome: "Loja Filial - Shopping",
      cidade: "Belo Horizonte",
      ativo: true,
    },
  ]);

  const [equipes, setEquipes] = useState([
    { id: 1, nome: "Equipe Diamante", loja: "Matriz - Centro", ativo: true },
    { id: 2, nome: "Equipe Ouro", loja: "Filial - Shopping", ativo: false },
  ]);

  const [metricas, setMetricas] = useState([
    { id: 1, nome: "Preço Alto", escopo: "Global", ativo: true },
    { id: 2, nome: "Apenas Olhando", escopo: "Global", ativo: true },
    {
      id: 3,
      nome: "Falta de Limite no Cartão",
      escopo: "Loja 02",
      ativo: false,
    },
  ]);

  // Função genérica para inverter o status ativo/inativo na memória
  const toggleStatus = (tipo, idKey, valorIdentificador) => {
    if (tipo === "usuarios") {
      setUsuarios((prev) =>
        prev.map((u) =>
          u[idKey] === valorIdentificador ? { ...u, ativo: !u.ativo } : u,
        ),
      );
    } else if (tipo === "lojas") {
      setLojas((prev) =>
        prev.map((l) =>
          l[idKey] === valorIdentificador ? { ...l, ativo: !l.ativo } : l,
        ),
      );
    } else if (tipo === "equipes") {
      setEquipes((prev) =>
        prev.map((e) =>
          e[idKey] === valorIdentificador ? { ...e, ativo: !e.ativo } : e,
        ),
      );
    } else if (tipo === "metricas") {
      setMetricas((prev) =>
        prev.map((m) =>
          m[idKey] === valorIdentificador ? { ...m, ativo: !m.ativo } : m,
        ),
      );
    }
  };

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
            Ative ou bloqueie acessos, filiais, grupos e indicadores do
            ecossistema.
          </p>
        </div>
      </div>

      {/* Menu das Sub-abas organizadoras */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-[#003847]/40 p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setSubAba("usuarios")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "usuarios" ? "bg-[#822659] text-white shadow-md shadow-[#822659]/20" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Users size={16} /> Usuários
        </button>
        <button
          onClick={() => setSubAba("lojas")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "lojas" ? "bg-[#822659] text-white shadow-md shadow-[#822659]/20" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Store size={16} /> Lojas
        </button>
        <button
          onClick={() => setSubAba("equipes")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "equipes" ? "bg-[#822659] text-white shadow-md shadow-[#822659]/20" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Component size={16} /> Equipes
        </button>
        <button
          onClick={() => setSubAba("metricas")}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-none cursor-pointer ${subAba === "metricas" ? "bg-[#822659] text-white shadow-md shadow-[#822659]/20" : "text-slate-400 hover:bg-white/5"}`}
        >
          <Target size={16} /> Métricas
        </button>
      </div>

      {/* Listas Dinâmicas de acordo com a Sub-aba */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-xl backdrop-blur-md">
        {/* Tabela Usuários */}
        {subAba === "usuarios" && (
          <div className="space-y-4">
            {usuarios.map((u) => (
              <div
                key={u.username}
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div>
                  <h4 className="font-bold text-white text-lg">{u.nome}</h4>
                  <p className="text-sm text-slate-400">
                    @{u.username} •{" "}
                    <span className="text-xs bg-[#822659]/30 text-rose-300 font-bold px-2 py-0.5 rounded">
                      {u.cargo}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() =>
                    toggleStatus("usuarios", "username", u.username)
                  }
                  className="bg-transparent border-none cursor-pointer outline-none transition-transform active:scale-95"
                >
                  {u.ativo ? (
                    <ToggleRight size={44} className="text-[#a8d3b2]" />
                  ) : (
                    <ToggleLeft size={44} className="text-slate-500" />
                  )}
                </button>
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
                  onClick={() => toggleStatus("lojas", "id", l.id)}
                  className="bg-transparent border-none cursor-pointer outline-none transition-transform active:scale-95"
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
                  <p className="text-sm text-slate-400">Alocada em: {e.lo}</p>
                </div>
                <button
                  onClick={() => toggleStatus("equipes", "id", e.id)}
                  className="bg-transparent border-none cursor-pointer outline-none transition-transform active:scale-95"
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
                  <p className="text-sm text-slate-400">Escopo: {m.escopo}</p>
                </div>
                <button
                  onClick={() => toggleStatus("metricas", "id", m.id)}
                  className="bg-transparent border-none cursor-pointer outline-none transition-transform active:scale-95"
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
    </div>
  );
}
