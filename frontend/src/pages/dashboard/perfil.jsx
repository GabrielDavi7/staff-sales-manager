import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import {
  User,
  Mail,
  Lock,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  ClipboardCheck,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react";
import { clsx } from "clsx";

export function Perfil() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Dados do formulário
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    pin: "",
    senha: "",
  });

  // Controla qual campo está em modo de edição individual
  const [editMode, setEditMode] = useState({
    first_name: false,
    last_name: false,
    email: false,
    pin: false,
    senha: false,
  });

  // Controla a visibilidade visual de campos mascarados
  const [showPin, setShowPin] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  // Inicializa os dados com o usuário logado no Context
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || user.nome || "",
        last_name: user.last_name || "",
        email: user.email || "",
        pin: user.pin || "",
        senha: "", // Senha nunca vem preenchida do backend por segurança
      });
    }
  }, [user]);

  // Ativa/Desativa o modo de edição de um campo específico
  const toggleEdit = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
    setError("");
    setSuccess("");
  };

  // Cancela a edição e restaura o valor original do Context
  const handleCancel = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "senha" ? "" : user[field] || "",
    }));
    toggleEdit(field);
  };

  // Salva a alteração de um campo individual no banco de dados
  const handleSaveField = async (field) => {
    setError("");
    setSuccess("");

    // Validações básicas antes do envio
    if (!formData[field] && field !== "senha") {
      setError("Este campo não pode ficar vazio.");
      return;
    }

    try {
      setLoading(true);

      // Payload dinâmico contendo apenas o campo modificado
      const payload = {
        [field]: formData[field],
      };

      // Ajuste para a sua rota exata de atualização de perfil/usuário se for diferente
      await api.patch(`/api/admin/usuarios/${user.id}/`, payload);

      setSuccess(
        `Campo ${field === "first_name" ? "Nome" : field} atualizado com sucesso!`,
      );
      setEditMode((prev) => ({ ...prev, [field]: false }));
    } catch (err) {
      console.error("Erro ao atualizar campo:", err);
      setError("Não foi possível salvar a alteração no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-2xl border border-blue-50 overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-[#4D7BAB]/5 px-10 py-8 border-b border-blue-50 flex items-center gap-5">
          <div className="p-4 bg-[#4D7BAB] rounded-2xl text-white shadow-lg">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
            <p className="text-sm text-slate-500">
              Gerencie suas informações de acesso e segurança
            </p>
          </div>
        </div>

        {/* Alertas de Feedback */}
        {error && (
          <div className="mx-10 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-center font-medium flex items-center justify-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="mx-10 mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-center font-medium flex items-center justify-center gap-2">
            <ClipboardCheck size={18} /> {success}
          </div>
        )}

        {/* Formulário/Grid de Dados */}
        <div className="p-10 space-y-6">
          {/* CAMPO: NOME */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100">
                <User size={20} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  disabled={!editMode.first_name}
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className={clsx(
                    "w-full bg-transparent font-bold text-slate-700 outline-none transition-all text-lg",
                    editMode.first_name && "border-b-2 border-[#4D7BAB] pb-0.5",
                  )}
                />
              </div>
            </div>

            {/* Botões laterais de Ação */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {editMode.first_name ? (
                <>
                  <button
                    onClick={() => handleSaveField("first_name")}
                    disabled={loading}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("first_name")}
                    className="p-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("first_name")}
                  className="p-2.5 bg-blue-50 text-[#4D7BAB] rounded-xl hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 font-bold text-sm"
                >
                  <Edit2 size={16} /> Editar
                </button>
              )}
            </div>
          </div>

          {/* CAMPO: SOBRENOME */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100">
                <User size={20} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sobrenome
                </label>
                <input
                  type="text"
                  disabled={!editMode.last_name}
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className={clsx(
                    "w-full bg-transparent font-bold text-slate-700 outline-none transition-all text-lg",
                    editMode.last_name && "border-b-2 border-[#4D7BAB] pb-0.5",
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {editMode.last_name ? (
                <>
                  <button
                    onClick={() => handleSaveField("last_name")}
                    disabled={loading}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("last_name")}
                    className="p-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("last_name")}
                  className="p-2.5 bg-blue-50 text-[#4D7BAB] rounded-xl hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 font-bold text-sm"
                >
                  <Edit2 size={16} /> Editar
                </button>
              )}
            </div>
          </div>

          {/* CAMPO: E-MAIL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  disabled={!editMode.email}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={clsx(
                    "w-full bg-transparent font-bold text-slate-700 outline-none transition-all text-lg",
                    editMode.email && "border-b-2 border-[#4D7BAB] pb-0.5",
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {editMode.email ? (
                <>
                  <button
                    onClick={() => handleSaveField("email")}
                    disabled={loading}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("email")}
                    className="p-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("email")}
                  className="p-2.5 bg-blue-50 text-[#4D7BAB] rounded-xl hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 font-bold text-sm"
                >
                  <Edit2 size={16} /> Editar
                </button>
              )}
            </div>
          </div>

          {/* CAMPO: PIN (MASCARADO) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-4 flex-1 w-full">
              <div className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100">
                <Lock size={20} />
              </div>
              <div className="flex-1 relative pr-10">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  PIN Operacional
                </label>
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={6}
                  disabled={!editMode.pin}
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({ ...formData, pin: e.target.value })
                  }
                  className={clsx(
                    "w-full bg-transparent font-mono font-bold text-slate-700 outline-none transition-all text-lg tracking-widest",
                    editMode.pin && "border-b-2 border-[#4D7BAB] pb-0.5",
                  )}
                />
                {/* Olho para ver/esconder PIN */}
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {editMode.pin ? (
                <>
                  <button
                    onClick={() => handleSaveField("pin")}
                    disabled={loading}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("pin")}
                    className="p-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("pin")}
                  className="p-2.5 bg-blue-50 text-[#4D7BAB] rounded-xl hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 font-bold text-sm"
                >
                  <Edit2 size={16} /> Editar
                </button>
              )}
            </div>
          </div>

          {/* CAMPO: SENHA (MASCARADO) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-4 flex-1 w-full">
              <div className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100">
                <Lock size={20} />
              </div>
              <div className="flex-1 relative pr-10">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nova Senha
                </label>
                <input
                  type={showSenha ? "text" : "password"}
                  placeholder={
                    editMode.senha ? "Insira a nova senha..." : "••••••••••••"
                  }
                  disabled={!editMode.senha}
                  value={formData.senha}
                  onChange={(e) =>
                    setFormData({ ...formData, senha: e.target.value })
                  }
                  className={clsx(
                    "w-full bg-transparent font-bold text-slate-700 outline-none transition-all text-lg",
                    editMode.senha && "border-b-2 border-[#4D7BAB] pb-0.5",
                  )}
                />
                {/* Olho para ver/esconder Senha */}
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-2 top-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {editMode.senha ? (
                <>
                  <button
                    onClick={() => handleSaveField("senha")}
                    disabled={loading}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("senha")}
                    className="p-2.5 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("senha")}
                  className="p-2.5 bg-blue-50 text-[#4D7BAB] rounded-xl hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1 font-bold text-sm"
                >
                  <Edit2 size={16} /> Alterar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loader global para feedback visual de carregamento */}
        {loading && (
          <div className="px-10 py-4 bg-slate-50 border-t flex items-center justify-center gap-2 text-[#4D7BAB] font-medium text-sm">
            <Loader2 className="animate-spin" size={16} /> Salvando alterações
            no servidor...
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;
