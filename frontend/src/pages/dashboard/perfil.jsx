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
  KeyRound,
} from "lucide-react";
import { clsx } from "clsx";

export function Perfil() {
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    pin: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [editMode, setEditMode] = useState({
    first_name: false,
    last_name: false,
    email: false,
    pin: false,
    senha: false,
  });

  const [showPin, setShowPin] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  const currentRole = user?.cargo?.toUpperCase() || "";
  const isVendedor = currentRole === "VENDEDOR";

  // Temas Dinâmicos Otimizados para Dark Mode
  const roleStyles = {
    ADMIN: {
      wrapper:
        "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50",
      headerBg: "bg-rose-500 text-white",
      title: "text-rose-900 dark:text-rose-400",
      subtitle: "text-rose-600 dark:text-rose-300",
      iconBox:
        "text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-800 bg-white dark:bg-slate-900",
      activeInput:
        "border-rose-500 dark:border-rose-400 text-rose-900 dark:text-rose-100",
      editBtn:
        "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-500/40",
      badge:
        "bg-rose-200 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50",
    },
    SUPERVISOR: {
      wrapper:
        "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50",
      headerBg: "bg-amber-500 text-white",
      title: "text-amber-900 dark:text-amber-400",
      subtitle: "text-amber-600 dark:text-amber-300",
      iconBox:
        "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900",
      activeInput:
        "border-amber-500 dark:border-amber-400 text-amber-900 dark:text-amber-100",
      editBtn:
        "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/40",
      badge:
        "bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50",
    },
    VENDEDOR: {
      wrapper:
        "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50",
      headerBg: "bg-[#4D7BAB] text-white",
      title: "text-blue-900 dark:text-blue-400",
      subtitle: "text-blue-600 dark:text-blue-300",
      iconBox:
        "text-[#4D7BAB] dark:text-blue-400 border-blue-100 dark:border-blue-800 bg-white dark:bg-slate-900",
      activeInput:
        "border-[#4D7BAB] dark:border-blue-400 text-blue-900 dark:text-blue-100",
      editBtn:
        "bg-blue-100 dark:bg-blue-500/20 text-[#4D7BAB] dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/40",
      badge:
        "bg-blue-200 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/50",
    },
  };
  const theme = roleStyles[currentRole] || roleStyles.VENDEDOR;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/users/user/me/");
        const data = response.data;
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          pin: data.pin || "",
        });
      } catch (err) {
        setError("Não foi possível carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const toggleEdit = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
    setError("");
    setSuccess("");
  };

  const handleCancel = (field) => {
    if (field === "senha") {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
    toggleEdit(field);
  };

  const handleSaveField = async (field) => {
    setError("");
    setSuccess("");
    if (!formData[field]) return setError("Este campo não pode ficar vazio.");
    if (field === "pin" && formData.pin.length !== 4)
      return setError("O PIN deve conter exatamente 4 dígitos.");

    try {
      setSaving(true);
      const payload = { [field]: formData[field] };
      await api.patch("/api/users/user/me/", payload);
      if (field === "first_name" || field === "last_name") {
        if (typeof setUser === "function")
          setUser((prev) => ({ ...prev, ...payload }));
      }
      setSuccess("Perfil atualizado com sucesso!");
      setEditMode((prev) => ({ ...prev, [field]: false }));
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao atualizar os dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setError("");
    setSuccess("");
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    )
      return setError("Preencha todos os campos de senha.");
    if (passwordData.new_password !== passwordData.confirm_password)
      return setError("A nova senha e a confirmação não coincidem.");

    try {
      setSaving(true);
      const payload = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      };
      await api.patch("/api/users/user/me/", payload);
      setSuccess("Senha atualizada com sucesso!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setEditMode((prev) => ({ ...prev, senha: false }));
    } catch (err) {
      setError(
        err.response?.data?.current_password?.[0] ||
          err.response?.data?.detail ||
          "Senha atual incorreta ou erro ao atualizar.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2
          className="animate-spin text-[#4D7BAB] dark:text-blue-500"
          size={48}
        />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Carregando seus dados...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className={clsx(
          "rounded-[2.5rem] shadow-2xl border overflow-hidden transition-colors",
          theme.wrapper,
        )}
      >
        {/* Cabeçalho */}
        <div className="px-10 py-8 border-b border-white/40 dark:border-slate-800 flex items-center gap-5">
          <div className={clsx("p-4 rounded-2xl shadow-lg", theme.headerBg)}>
            <User size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={clsx(
                    "text-3xl font-extrabold tracking-tight",
                    theme.title,
                  )}
                >
                  Meu Perfil
                </h1>
                <p className={clsx("text-sm font-medium mt-1", theme.subtitle)}>
                  Gerencie suas informações de acesso e segurança
                </p>
              </div>
              <span
                className={clsx(
                  "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm",
                  theme.badge,
                )}
              >
                {currentRole}
              </span>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mx-10 mt-6 p-4 bg-white/60 dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl font-bold flex items-center gap-3 backdrop-blur-sm transition-colors">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        {success && (
          <div className="mx-10 mt-6 p-4 bg-white/60 dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl font-bold flex items-center gap-3 backdrop-blur-sm transition-colors">
            <ClipboardCheck size={20} /> {success}
          </div>
        )}

        {/* Formulário / Grid */}
        <div className="p-10 space-y-5">
          {/* NOME */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-white/50 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div
                className={clsx(
                  "p-3 rounded-xl border shadow-sm",
                  theme.iconBox,
                )}
              >
                <User size={20} />
              </div>
              <div className="flex-1">
                <label
                  className={clsx(
                    "block text-xs font-bold uppercase tracking-wider mb-1",
                    theme.subtitle,
                  )}
                >
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
                    "w-full bg-transparent font-bold outline-none transition-all text-lg text-slate-800 dark:text-slate-100",
                    editMode.first_name &&
                      `border-b-2 pb-0.5 ${theme.activeInput}`,
                  )}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode.first_name ? (
                <>
                  <button
                    onClick={() => handleSaveField("first_name")}
                    disabled={saving}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("first_name")}
                    className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("first_name")}
                  className={clsx(
                    "p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                    theme.editBtn,
                  )}
                >
                  <Edit2 size={16} /> Editar
                </button>
              )}
            </div>
          </div>

          {/* SOBRENOME */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-white/50 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div
                className={clsx(
                  "p-3 rounded-xl border shadow-sm",
                  theme.iconBox,
                )}
              >
                <User size={20} />
              </div>
              <div className="flex-1">
                <label
                  className={clsx(
                    "block text-xs font-bold uppercase tracking-wider mb-1",
                    theme.subtitle,
                  )}
                >
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
                    "w-full bg-transparent font-bold outline-none transition-all text-lg text-slate-800 dark:text-slate-100",
                    editMode.last_name &&
                      `border-b-2 pb-0.5 ${theme.activeInput}`,
                  )}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode.last_name ? (
                <>
                  <button
                    onClick={() => handleSaveField("last_name")}
                    disabled={saving}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("last_name")}
                    className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("last_name")}
                  className={clsx(
                    "p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                    theme.editBtn,
                  )}
                >
                  <Edit2 size={16} /> Editar
                </button>
              )}
            </div>
          </div>

          {/* E-MAIL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-white/50 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div
                className={clsx(
                  "p-3 rounded-xl border shadow-sm",
                  theme.iconBox,
                )}
              >
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <label
                  className={clsx(
                    "block text-xs font-bold uppercase tracking-wider mb-1",
                    theme.subtitle,
                  )}
                >
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
                    "w-full bg-transparent font-bold outline-none transition-all text-lg text-slate-800 dark:text-slate-100",
                    editMode.email && `border-b-2 pb-0.5 ${theme.activeInput}`,
                  )}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode.email ? (
                <>
                  <button
                    onClick={() => handleSaveField("email")}
                    disabled={saving}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleCancel("email")}
                    className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit("email")}
                  className={clsx(
                    "p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                    theme.editBtn,
                  )}
                >
                  <Edit2 size={16} /> Editar
                </button>
              )}
            </div>
          </div>

          {/* PIN */}
          {isVendedor && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-white/50 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={clsx(
                    "p-3 rounded-xl border shadow-sm",
                    theme.iconBox,
                  )}
                >
                  <Lock size={20} />
                </div>
                <div className="flex-1 relative pr-10">
                  <label
                    className={clsx(
                      "block text-xs font-bold uppercase tracking-wider mb-1",
                      theme.subtitle,
                    )}
                  >
                    PIN Operacional
                  </label>
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={4}
                    disabled={!editMode.pin}
                    value={formData.pin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pin: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className={clsx(
                      "w-full bg-transparent font-mono font-bold outline-none transition-all text-lg tracking-widest text-slate-800 dark:text-slate-100",
                      editMode.pin && `border-b-2 pb-0.5 ${theme.activeInput}`,
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2 top-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editMode.pin ? (
                  <>
                    <button
                      onClick={() => handleSaveField("pin")}
                      disabled={saving}
                      className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleCancel("pin")}
                      className="p-2.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleEdit("pin")}
                    className={clsx(
                      "p-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                      theme.editBtn,
                    )}
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ALTERAÇÃO DE SENHA */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-white/50 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={clsx(
                    "p-3 rounded-xl border shadow-sm",
                    theme.iconBox,
                  )}
                >
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                    Alterar Senha
                  </h3>
                  <p
                    className={clsx(
                      "text-xs font-bold uppercase tracking-wider",
                      theme.subtitle,
                    )}
                  >
                    Proteja sua conta
                  </p>
                </div>
              </div>
              {!editMode.senha && (
                <button
                  onClick={() => toggleEdit("senha")}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                    theme.editBtn,
                  )}
                >
                  <Edit2 size={16} /> Alterar
                </button>
              )}
            </div>

            {editMode.senha && (
              <div className="mt-6 space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type={showSenha ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                    className={clsx(
                      "w-full p-3 rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-slate-200",
                      theme.activeInput,
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type={showSenha ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                      }
                      className={clsx(
                        "w-full p-3 rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-slate-200",
                        theme.activeInput,
                      )}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showSenha ? "text" : "password"}
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm_password: e.target.value,
                        })
                      }
                      className={clsx(
                        "w-full p-3 rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-slate-200",
                        theme.activeInput,
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showSenha ? (
                      <>
                        <EyeOff size={16} /> Ocultar Senhas
                      </>
                    ) : (
                      <>
                        <Eye size={16} /> Mostrar Senhas
                      </>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancel("senha")}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSavePassword}
                      disabled={saving}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md"
                    >
                      Salvar Senha
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {saving && (
          <div className="px-10 py-4 bg-white/40 dark:bg-slate-900/40 border-t border-white/40 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm transition-colors">
            <Loader2 className="animate-spin" size={16} /> Salvando
            alterações...
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;
