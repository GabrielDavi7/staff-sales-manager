import React, { useState, useEffect } from "react";
import {
  Store,
  Users,
  Target,
  Component,
  ShieldAlert,
  ChevronRight,
  FileText,
  ToggleRight,
} from "lucide-react";

// Instância personalizada do Axios do seu projeto (já configurada com a baseURL)
import api from "../../api/axios";

// Suas Importações Modulares de Telas
import CriarUsuario from "./CriarUsuario";
import CriarLoja from "./CriarLoja";
import CriarMetrica from "./CriarMetrica";
import CriarEquipe from "./CriarEquipe";
import RelatorioAtendimento from "./RelatorioAtendimento";
import GerenciarStatus from "./GerenciarStatus";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminPainel() {
  const { user } = useAuth();
  const [telaAtiva, setTelaAtiva] = useState("menu");

  // Estado que alimenta os contadores do Dashboard
  const [dashboardData, setDashboardData] = useState({
    lojas: 0,
    funcionarios: 0,
    equipes: 0,
    metricas: 0,
    loading: true,
  });

  useEffect(() => {
    if (telaAtiva === "menu") {
      setDashboardData((prev) => ({ ...prev, loading: true }));

      const fetchTotaisAPI = async () => {
        try {
          // Buscando simultaneamente de todas as rotas mapeadas no Django
          const [resLojas, resMetricas, resUsuarios, resEquipes] =
            await Promise.all([
              api.get("/api/admin/lojas/"),
              api.get("/api/admin/metricas/"),
              api.get("/api/admin/usuarios/"),
              api.get("/api/admin/equipes/"),
            ]);

          // Função de contagem adaptiva e protegida contra campos inexistentes
          // Substitua APENAS a função contarAtivos dentro do useEffect do seu AdminPainel.jsx

          const contarAtivos = (response) => {
            const dados = response?.data?.results || response?.data;
            if (!Array.isArray(dados)) return 0;

            // Filtra a lista dinamicamente checando os dois padrões do Django
            return dados.filter((item) => {
              // 1. Se for uma Loja/Métrica/Equipe e estiver explicitamente falsa
              if (item.ativo === false) return false;

              // 2. Se for um Usuário do Django (is_active) e estiver explicitamente falso
              if (item.is_active === false) return false;

              // Se passou pelas checagens, o registro está ativo e deve ser contado
              return true;
            }).length;
          };

          setDashboardData({
            lojas: contarAtivos(resLojas),
            metricas: contarAtivos(resMetricas),
            funcionarios: contarAtivos(resUsuarios),
            equipes: contarAtivos(resEquipes),
            loading: false,
          });
        } catch (error) {
          console.error(
            "Erro ao carregar dados do painel administrativo:",
            error,
          );
          setDashboardData((prev) => ({ ...prev, loading: false }));
        }
      };

      fetchTotaisAPI();
    }
  }, [telaAtiva, user]);

  const renderValor = (valor) => {
    if (dashboardData.loading) {
      return <span className="animate-pulse text-white/20 text-3xl">...</span>;
    }
    return valor.toString().padStart(2, "0");
  };

  return (
    <div className="bg-[#004D61] w-full min-h-[85vh] rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col gap-8 animate-in fade-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      {telaAtiva === "menu" && (
        <>
          <div className="flex flex-col relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="text-[#822659]" size={32} />
              <h1 className="text-4xl font-black tracking-tight">
                Centro de Comando
              </h1>
            </div>
            <p className="text-slate-300 font-medium text-lg">
              Visão em tempo real da rede e gestão executiva.
            </p>
          </div>

          {/* DASHBOARD TOTALMENTE INTEGRADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Lojas */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-md shadow-lg transition-all hover:bg-white/10">
              <Store size={28} className="mb-4 text-[#4D7BAB]" />
              <h3 className="text-slate-400 font-bold uppercase text-xs mb-1">
                Lojas Ativas
              </h3>
              <p className="text-4xl font-extrabold text-white">
                {renderValor(dashboardData.lojas)}
              </p>
            </div>

            {/* Funcionários */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-md shadow-lg transition-all hover:bg-white/10">
              <Users size={28} className="mb-4 text-[#4D7BAB]" />
              <h3 className="text-slate-400 font-bold uppercase text-xs mb-1">
                Funcionários Ativos
              </h3>
              <p className="text-4xl font-extrabold text-white">
                {renderValor(dashboardData.funcionarios)}
              </p>
            </div>

            {/* Equipes */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-md shadow-lg transition-all hover:bg-white/10">
              <Component size={28} className="mb-4 text-[#3E5641]" />
              <h3 className="text-slate-400 font-bold uppercase text-xs mb-1">
                Equipes Ativas
              </h3>
              <p className="text-4xl font-extrabold text-white">
                {renderValor(dashboardData.equipes)}
              </p>
            </div>

            {/* Métricas */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-md shadow-lg transition-all hover:bg-white/10">
              <Target size={28} className="mb-4 text-[#822659]" />
              <h3 className="text-slate-400 font-bold uppercase text-xs mb-1">
                Métricas Ativas
              </h3>
              <p className="text-4xl font-extrabold text-white">
                {renderValor(dashboardData.metricas)}
              </p>
            </div>
          </div>

          {/* SEÇÃO DOS MÓDULOS DE NAVEGAÇÃO INTERNA */}
          <div className="mt-6 relative z-10 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold mb-6">Módulos Corporativos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Controle rápido: ative ou desative usuários, lojas, métricas e
                  equipes via Soft Delete.
                </p>
              </button>

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
                  Auditoria e edição profunda do histórico de vendas e perdas
                  registradas.
                </p>
              </button>

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
                  Registre novos motivos de perda e metas para análise do funil
                  de conversão.
                </p>
              </button>

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
                  Cadastre novas unidades, filiais ou quiosques para expandir a
                  estrutura.
                </p>
              </button>

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
                  Crie novos grupos e vincule times comerciais estruturados às
                  unidades físicas.
                </p>
              </button>

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
                  Cadastre novos usuários no sistema com níveis de acesso
                  protegidos.
                </p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Roteamento das Sub-telas */}
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
