import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/landing/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ nome: "", email: "", telefone: "", mensagem: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contato" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-amber-600 font-semibold text-sm tracking-wide uppercase">
            Fale Conosco
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Pronto para transformar sua gestão?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Preencha o formulário abaixo e entraremos em contato para uma
            demonstração personalizada.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nome
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={form.nome}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="telefone"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label
              htmlFor="mensagem"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Mensagem
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              rows={4}
              required
              value={form.mensagem}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition resize-none"
              placeholder="Conte-nos sobre seu negócio e o que você busca..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-3.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Enviar mensagem
          </button>

          {status === "success" && (
            <p className="text-green-600 text-sm text-center font-medium">
              ✅ Mensagem enviada com sucesso! Entraremos em contato em breve.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm text-center font-medium">
              ❌ Erro ao enviar. Tente novamente ou envie um email direto para
              contato@joiasmanager.com.br.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
