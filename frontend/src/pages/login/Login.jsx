import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn, User, Lock, Eye, EyeOff, Diamond } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Novo estado para o checkbox
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user: authUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(username, password);

    if (result.success) {
      const userRole = result.user?.cargo;

      if (userRole === "DISPOSITIVO") {
        navigate("/registrarvenda", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setError(result.error || "Usuário ou senha incorretos.");
    }
    setIsLoading(false);
  };

  return (
    // Fundo com o gradiente solicitado e overflow escondido para as formas não passarem da tela
    <div className="min-h-screen bg-gradient-to-br from-[#010528] to-[#004BBE] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Elementos decorativos de fundo para simular as formas abstratas da imagem */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#004BBE] rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-[#010528] rounded-full mix-blend-multiply filter blur-[100px] opacity-80"></div>
      <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-[#4D7BAB] rounded-full mix-blend-overlay filter blur-[80px] opacity-50"></div>

      {/* Card Glassmorphism (Efeito de Vidro) */}
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 p-8 sm:p-12 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo Centralizada */}
        <div className="flex flex-col items-center mb-10">
          <Diamond
            size={48}
            strokeWidth={1.5}
            className="text-white mb-3 drop-shadow-md"
          />
          <h1 className="text-2xl font-bold text-white tracking-wider drop-shadow-md">
            Joias Manager
          </h1>
        </div>

        <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/20 border border-rose-500/50 text-white text-sm rounded-2xl animate-in slide-in-from-top-2 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Input: Usuário / E-mail */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-100 ml-1">
              Email ou Usuário
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#004BBE]">
                <User size={20} />
              </div>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username@gmail.com"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#004BBE] focus:ring-4 focus:ring-[#004BBE]/20 outline-none transition-all text-slate-800 font-medium shadow-inner"
              />
            </div>
          </div>

          {/* Input: Senha */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-100 ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#004BBE]">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-[#004BBE] focus:ring-4 focus:ring-[#004BBE]/20 outline-none transition-all text-slate-800 font-medium shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#004BBE] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Funcionalidades Extras: Manter Conectado & Esqueci Senha */}
          <div className="flex items-center justify-between text-sm mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-blue-100 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/10 accent-[#004BBE] cursor-pointer"
              />
              <span>Manter conectado</span>
            </label>

            <button
              type="button"
              onClick={() =>
                alert("Função de recuperação de senha em desenvolvimento!")
              }
              className="text-blue-200 hover:text-white hover:underline underline-offset-2 transition-colors font-medium bg-transparent border-none p-0 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 py-4 bg-[#010528] text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} /> Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
