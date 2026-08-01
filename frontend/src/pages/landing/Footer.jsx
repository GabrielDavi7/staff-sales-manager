export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Marca */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Joias Manager</h3>
            <p className="text-sm leading-relaxed">
              Sistema de gestão de atendimentos para lojas e varejo.
              Transforme dados em decisões.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#metricas" className="hover:text-amber-400 transition-colors">Funcionalidades</a></li>
              <li><a href="#planos" className="hover:text-amber-400 transition-colors">Planos</a></li>
              <li><a href="#contato" className="hover:text-amber-400 transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>contato@joiasmanager.com.br</li>
              <li>Porto Alegre, RS</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Joias Manager. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
