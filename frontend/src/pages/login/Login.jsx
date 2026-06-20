import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  Diamond,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Adicionado o rememberMe como arguumento para o AuthContext
    const result = await login(username, password, rememberMe);

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
    <div className="min-h-screen bg-[#010528] bg-gradient-to-br from-[#010528] via-[#001A4F] to-[#010528] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-15%] left-[-10%] w-[35rem] h-[35rem] bg-[#004BBE]/20 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[40rem] h-[40rem] bg-[#002A7A]/30 rounded-full blur-[150px]"></div>

      <div className="max-w-5xl w-full bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-between items-center text-center relative overflow-hidden bg-[#010528]/60 border-r border-white/5">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>

          <div className="relative z-10 flex flex-col items-center flex-1 justify-center space-y-8">
            <div className="p-6 bg-[#D4AF37]/10 backdrop-blur-sm rounded-full border border-[#D4AF37]/20 shadow-inner-gold">
              <Diamond
                size={72}
                strokeWidth={1}
                className="text-[#D4AF37] drop-shadow-gold"
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tighter">
                Staff <span className="text-[#D4AF37]">SalesManager</span>
              </h1>
              <p className="text-blue-100/80 text-lg max-w-sm mx-auto font-light leading-relaxed">
                Painel de administração de vendas para lojas.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10 text-xs text-blue-200/50 flex items-center gap-2 border-t border-white/5 w-full justify-center">
            <ShieldCheck size={14} className="text-[#D4AF37]/70" /> Plataforma
            versão 1.2.5 - 26/06/2026 // ultima versão da 1.2
          </div>
        </div>

        <div className="md:w-1/2 p-10 lg:p-16 flex flex-col justify-center bg-white/5">
          <div className="flex md:hidden flex-col items-center mb-12 text-center">
            <Diamond
              size={40}
              strokeWidth={1.5}
              className="text-[#D4AF37] mb-3"
            />
            <h1 className="text-2xl font-bold text-white tracking-wider">
              Joias Manager
            </h1>
          </div>

          <div className="mb-12 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Acessar Conta
            </h2>
            <p className="text-blue-100/70 mt-3 text-base">
              Identifique-se para gerenciar suas operações.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm rounded-xl animate-in slide-in-from-top-2 backdrop-blur-sm flex items-center gap-3 font-medium">
                <XCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-2.5">
              <label
                htmlFor="username"
                className="text-sm font-semibold text-blue-100/90 ml-1 tracking-wide"
              >
                E-mail do Usuário
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300/60 group-focus-within:text-[#D4AF37] transition-colors">
                  <User size={20} strokeWidth={2} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu e-mail ou nome de usuário"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 text-white placeholder:text-blue-200/40 text-base"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-blue-100/90 ml-1 tracking-wide"
              >
                Senha de Acesso
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300/60 group-focus-within:text-[#D4AF37] transition-colors">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all duration-200 text-white placeholder:text-blue-200/40 text-base"
                />
                <button
                  type="button"
                  tabIndex="-1"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300/60 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-blue-100/80 hover:text-white transition-colors group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-white/5 checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-all cursor-pointer focus:ring-2 focus:ring-[#D4AF37]/30 focus:outline-none"
                  />
                  <Check
                    size={14}
                    strokeWidth={3}
                    className="absolute text-[#010528] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  />
                </div>
                <span className="font-medium">Manter conectado</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert("Função de recuperação de senha em desenvolvimento!")
                }
                className="text-[#D4AF37] hover:text-[#f3cd5d] hover:underline underline-offset-4 transition-colors font-semibold bg-transparent border-none p-0 cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-4 bg-[#D4AF37] text-[#010528] rounded-xl font-extrabold text-lg shadow-lg hover:bg-[#f3cd5d] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group border border-[#D4AF37]/50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-[#010528]/20 border-t-[#010528] rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn
                    size={22}
                    className="group-hover:translate-x-1 transition-transform"
                  />{" "}
                  Acessar Sistema
                </>
              )}
            </button>
          </form>

          <p className="mt-16 text-center text-blue-200/30 text-xs font-light tracking-wide">
            © {new Date().getFullYear()} Staff Sales Manager.
          </p>
        </div>
      </div>
    </div>
  );
};

const Check = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XCircle = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default Login;
