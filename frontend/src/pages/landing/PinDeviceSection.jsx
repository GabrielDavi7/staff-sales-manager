import telaPin from '../../assets/landing/TelaParaMostrarPinDoRegistro.png';

export default function PinDeviceSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Tablet Mockup */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Tablet frame */}
              <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl max-w-[320px]">
                {/* Notch */}
                <div className="flex justify-center mb-3">
                  <div className="bg-gray-800 w-20 h-1.5 rounded-full" />
                </div>
                {/* Tela */}
                <div className="bg-white rounded-2xl overflow-hidden">
                  <img
                    src={telaPin}
                    alt="Tela de registro com PIN — cada atendimento tem um responsável"
                    className="w-full"
                  />
                </div>
                {/* Home indicator */}
                <div className="flex justify-center mt-3">
                  <div className="bg-gray-700 w-28 h-1 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-6">
            <span className="text-amber-600 font-semibold text-sm tracking-wide uppercase">
              Dispositivo com PIN
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Segurança e responsabilidade.
              <br />
              <span className="text-amber-600">Cada registro tem um dono.</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              O tablet na loja permite que qualquer vendedor registre atendimentos
              com seu PIN pessoal de 4 dígitos. Simples, rápido e 100% rastreável —
              elimine de vez o medo de dados fraudados pela equipe.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rastreabilidade total</h4>
                  <p className="text-sm text-gray-500 mt-1">Cada ação vinculada a um vendedor específico.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Registro instantâneo</h4>
                  <p className="text-sm text-gray-500 mt-1">Toques na tela, sem login complexo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
