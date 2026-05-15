import React, { useState } from "react";
import {
  Store,
  Users,
  Target,
  TrendingUp,
  Settings,
  ShieldAlert,
  ChevronRight,
  FileText,
  Component,
  ToggleRight,
} from "lucide-react";

// Importações Modulares de Arquivos Isolados
import CriarUsuario from "./CriarUsuario";
import CriarLoja from "./CriarLoja";
import CriarMetrica from "./CriarMetrica";
import CriarEquipe from "./CriarEquipe";
import RelatorioAtendimento from "./RelatorioAtendimento";
import GerenciarStatus from "./GerenciarStatus"; // <-- Módulo novo importado!

export default function AdminPainel() {
  const [telaAtiva, setTelaAtiva] = useState("menu");

  return (
    <div className="bg-[#004D61] w-full min-h-[85vh] rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col gap-8 animate-in fade-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      {telaAtiva === "menu" && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="text-[#822659]" size={32} />
                <h1 className="text-4xl font-black tracking-tight">
                  Centro de Comando
                </h1>
              </div>
              <p className="text-slate-300 font-medium text-lg">
                Gestão estratégica corporativa de alto nível executivo.
              </p>
            </div>
            <button className="px-8 py-4 bg-[#822659] hover:bg-[#6a1d47] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#822659]/30 flex items-center gap-2 cursor-pointer border-none outline-none">
              <Settings size={20} /> Configurações Globais
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md">
              <Store size={28} className="mb-4 text-white/50" />
              <h3 className="text-slate-400 font-bold uppercase text-xs mb-1">
                Lojas Ativas
              </h3>
              <p className="text-4xl font-extrabold text-white">03</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-md">
              <Users size={28} className="mb-4 text-white/50" />
              <h3 className="text-slate-400 font-bold uppercase text-xs mb-1">
                Equipe Registrada
              </h3>
              <p className="text-4xl font-extrabold text-white">12</p>
            </div>
            <div className="bg-[#3E5641] p-8 rounded-[2rem] relative overflow-hidden">
              <TrendingUp
                size={100}
                className="absolute -right-4 -top-4 opacity-10"
              />
              <h3 className="text-[#a8d3b2] font-bold uppercase text-xs mb-1 relative z-10">
                Performance Geral
              </h3>
              <p className="text-4xl font-extrabold text-white relative z-10">
                +24%
              </p>
            </div>
          </div>

          <div className="mt-6 relative z-10">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-2">
              Módulos Corporativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CARD: NOVO MÓDULO DE GESTÃO DE STATUS (SUPER IMPORTANTE!) */}
              <button
                onClick={() => setTelaAtiva("gerenciar_status")}
                className="group text-left bg-[#822659]/10 hover:bg-[#822659]/20 border border-[#822659]/30 hover:border-[#822659] p-8 rounded-[2rem] transition-all duration-300 cursor-pointer outline-none"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-[#822659] text-white rounded-2xl shadow-lg">
                    <ToggleRight size={32} />
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-rose-400 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-rose-200 group-hover:text-white">
                  Gerenciamento de Status
                </h3>
                <p className="text-slate-300 text-sm">
                  Controle operacional rápido: ative ou desative usuários,
                  lojas, métricas e equipes.
                </p>
              </button>

              {/* Card: Auditoria de Atendimentos */}
              <button
                onClick={() => setTelaAtiva("relatorio_atendimento")}
                className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#3E5641] p-8 rounded-[2rem] transition-all duration-300 cursor-pointer outline-none"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-white/5 group-hover:bg-[#3E5641] text-slate-300 group-hover:text-white rounded-2xl transition-colors">
                    <FileText size={32} />
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Relatório de Atendimentos
                </h3>
                <p className="text-slate-400 text-sm">
                  Auditoria e edição profunda do histórico de vendas e motivos
                  de perdas.
                </p>
              </button>

              {/* Card: Criar Métricas */}
              <button
                onClick={() => setTelaAtiva("criar_metrica")}
                className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#822659] p-8 rounded-[2rem] transition-all duration-300 cursor-pointer outline-none"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-white/5 group-hover:bg-[#822659] text-slate-300 group-hover:text-white rounded-2xl transition-colors">
                    <Target size={32} />
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Criar Nova Métrica
                </h3>
                <p className="text-slate-400 text-sm">
                  Registre novos motivos de perda e metas para os funis de
                  conversão.
                </p>
              </button>

              {/* Card: Criar Loja */}
              <button
                onClick={() => setTelaAtiva("criar_loja")}
                className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4D7BAB] p-8 rounded-[2rem] transition-all duration-300 cursor-pointer outline-none"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-white/5 group-hover:bg-[#4D7BAB] text-slate-300 group-hover:text-white rounded-2xl transition-colors">
                    <Store size={32} />
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Criar Nova Loja
                </h3>
                <p className="text-slate-400 text-sm">
                  Cadastre novas unidades, filiais ou quiosques estruturais.
                </p>
              </button>

              {/* Card: Criar Equipe */}
              <button
                onClick={() => setTelaAtiva("criar_equipe")}
                className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4D7BAB] p-8 rounded-[2rem] transition-all duration-300 cursor-pointer outline-none"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-white/5 group-hover:bg-[#4D7BAB] text-slate-300 group-hover:text-white rounded-2xl transition-colors">
                    <Component size={32} />
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Criar Nova Equipe
                </h3>
                <p className="text-slate-400 text-sm">
                  Crie novos grupos e vincule times comerciais às unidades
                  físicas.
                </p>
              </button>

              {/* Card: Criar Usuário */}
              <button
                onClick={() => setTelaAtiva("criar_usuario")}
                className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#4D7BAB] p-8 rounded-[2rem] transition-all duration-300 cursor-pointer outline-none"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="p-4 bg-white/5 group-hover:bg-[#4D7BAB] text-slate-300 group-hover:text-white rounded-2xl transition-colors">
                    <Users size={32} />
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-slate-500 group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Registrar Colaborador
                </h3>
                <p className="text-slate-400 text-sm">
                  Cadastre novos usuários com níveis de acesso protegidos.
                </p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* CHASSIS DE ROTEAMENTO DOS SUB-COMPONENTES DINÂMICOS */}
      {telaAtiva === "criar_loja" && (
        <CriarLoja onBack={() => setTelaAtiva("menu")} />
      )}
      {telaAtiva === "criar_usuario" && (
        <CriarUsuario onBack={() => setTelaAtiva("menu")} />
      )}
      {telaAtiva === "criar_metrica" && (
        <CriarMetrica onBack={() => setTelaAtiva("menu")} />
      )}
      {telaAtiva === "criar_equipe" && (
        <CriarEquipe onBack={() => setTelaAtiva("menu")} />
      )}
      {telaAtiva === "relatorio_atendimento" && (
        <RelatorioAtendimento onBack={() => setTelaAtiva("menu")} />
      )}
      {telaAtiva === "gerenciar_status" && (
        <GerenciarStatus onBack={() => setTelaAtiva("menu")} />
      )}
    </div>
  );
}
