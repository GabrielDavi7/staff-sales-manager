import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Retorna o slug atual (da URL ou do usuario logado)
 * e a funcao `buildPath` para construir rotas com slug.
 *
 * Uso:
 *   const { buildPath } = useAppPath();
 *   navigate(buildPath("/adminpainel"));
 *   <Link to={buildPath("/dashboard")}>Dashboard</Link>
 */
export function useAppPath() {
  const { slug: urlSlug } = useParams();
  const { user } = useAuth();

  const slug = urlSlug || user?.cliente_slug || "";
  const base = slug ? `/${slug}` : "";

  const buildPath = (path) => {
    if (!path.startsWith("/")) path = `/${path}`;
    return `${base}${path}`;
  };

  return { slug, base, buildPath };
}
