import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn, User, Lock, Eye, EyeOff, Diamond } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Usuário ou senha incorretos.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8">
      {/* Container Principal Retangular */}
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100/50 border border-blue-50 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">
        {/* Lado Esquerdo: Banner com a Paleta Azul */}
        <div className="md:w-1/2 bg-[#4D7BAB] p-12 flex flex-col justify-center items-center text-white text-center space-y-6">
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
            <Diamond size={64} strokeWidth={1} className="text-[#B1DBFF]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Joias Manager</h1>
          </div>
          <div className="pt-8 w-16 h-1 bg-[#B1DBFF]/50 rounded-full"></div>
        </div>

        {/* Lado Direito: Formulário de Login */}
        <div className="md:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Acesso
            </h2>
            <p className="text-slate-500 mt-2">
              Bem-vindo de volta! Entre com seus dados.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {/* Input Usuário */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Usuário
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4D7BAB] transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#4D7BAB] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#4D7BAB] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#4D7BAB] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-700 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#4D7BAB] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#4D7BAB] text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/10 hover:bg-[#3a5d82] hover:shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-slate-400 text-xs">
            © 2026 Joias Manager - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
