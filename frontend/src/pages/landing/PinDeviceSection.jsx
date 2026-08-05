import { ShieldCheck, Zap } from "lucide-react";
import telaPin from "../../assets/landing/TelaParaMostrarPinDoRegistro.png";

export default function PinDeviceSection() {
  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Tablet Mockup */}
          <div className="relative flex justify-center animate-in fade-in slide-in-from-left-8 duration-700">
            {/* Efeito de Brilho no Fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative">
              {/* Tablet frame estilo iPad */}
              <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl shadow-slate-300 max-w-[320px] border border-slate-800">
                {/* Câmera / Notch */}
                <div className="flex justify-center mb-3">
                  <div className="bg-slate-800 w-16 h-1.5 rounded-full" />
                </div>
                {/* Tela */}
                <div className="bg-slate-50 rounded-2xl overflow-hidden relative">
                  <img
                    src={telaPin}
                    alt="Tela de registro com PIN"
                    className="w-full relative z-10"
                  />
                </div>
                {/* Home indicator */}
                <div className="flex justify-center mt-3">
                  <div className="bg-slate-700 w-24 h-1 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
            <div>
              <span className="inline-block bg-slate-100 text-slate-600 font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
                Dispositivo com PIN
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Segurança e<br />
                <span className="text-amber-500">responsabilidade.</span>
              </h2>
            </div>

            <p className="text-lg text-slate-600 leading-relaxed max-w-lg font-medium">
              O tablet na loja permite que qualquer vendedor registre
              atendimentos com seu PIN pessoal de 4 dígitos. Simples, rápido e
              100% rastreável — elimine o medo de dados fraudados.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm border border-emerald-200">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Rastreabilidade</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Cada ação fica vinculada a um vendedor específico no
                    sistema.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm border border-blue-200">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Registro a jato</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Toques rápidos na tela, sem necessidade de logins complexos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
