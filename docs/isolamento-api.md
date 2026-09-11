# Isolamento da API das empresas

Implementado na branch M3-IsolamentoPorCliente. Esta entrega remove o cargo global da API de clientes; as duas tabelas de identidade e o novo painel SaaS ficam para uma próxima etapa.

## Regras

| Identidade | Acesso |
|---|---|
| ADMIN_CLIENTE | Dados e cadastros da própria empresa; registro para vendedores autorizados |
| SUPERVISOR | Indicadores/atendimentos da própria loja; sem alteração de atendimentos |
| VENDEDOR | Seus atendimentos e exportações; sem transferência do vendedor do registro |
| DISPOSITIVO | Registro para vendedor ativo da própria loja mediante PIN; sem indicadores/exportações |
| Sem cliente, cargo legado, cliente inativo/expirado ou vínculos inconsistentes | Acesso à API negado |

Staff/superusuário não concede exceção à API. Temporariamente, `/admin/` aceita apenas superusuário staff ativo **sem empresa**, para manutenção. O Unfold usa o AdminSite restrito. Contas de clientes não podem entrar nesse painel, mesmo se possuírem flags de staff.

O backend filtra listagens, detalhes, alterações, indicadores e exportações pelo escopo compartilhado em `users/tenant.py`. IDs fora do escopo retornam 404; vínculos inválidos no payload retornam 400. Uma autenticação válida com vínculo de empresa inválido retorna 403.

ADMIN_CLIENTE não cria nem promove administradores, não altera outro administrador e não rebaixa/desativa a própria conta. Essas operações ficam na manutenção. Campos de staff/grupos/permissões e mudanças de empresa são rejeitados. PIN não aparece na listagem administrativa.

## Preservação de dados e migrações

- `users.0005_remove_global_role`: converte ADMIN com empresa para ADMIN_CLIENTE. ADMIN sem empresa recebe cargo vazio, sem apagar a conta ou suas credenciais/flags técnicas. A reversão não promove usuários novamente.
- `core.0006_report_ownership`: adiciona empresa e loja do atendimento e preenche apenas quando os vínculos antigos são coerentes. Preserva ID, vendedor, valores e demais dados. Registros ambíguos ficam sem propriedade e invisíveis na API até saneamento explícito; não são atribuídos por suposição.
- Atendimentos existentes não podem trocar vendedor/empresa/loja. Novos atendimentos recebem a empresa e loja do vendedor autorizado. Transferência do vendedor para outra loja da mesma empresa não altera os relatórios antigos.
- Transferências de usuário/loja entre empresas e de equipe/métrica entre lojas são bloqueadas nas gravações normais. Exclusão de vendedor/loja/empresa referenciada por histórico é protegida.
- As validações de modelo não substituem uma política para SQL direto ou `QuerySet.update`: os comandos administrativos devem respeitá-las. O backfill inicial agora aborta se houver qualquer cliente; o seed de demonstração só roda em banco vazio e em transação.

No banco local autorizado, as duas migrações foram aplicadas após backup. Os dois atendimentos conservaram IDs e vendedores (mesmo checksum antes/depois), e ambos receberam propriedade. As duas contas globais ficaram sem cargo operacional. A conta ADMIN_CLIENTE sem empresa permanece bloqueada e precisa de associação manual à empresa correta.

## Ambiente e validação

O PostgreSQL de desenvolvimento publica `127.0.0.1:5433` por padrão, configurável com `POSTGRES_PUBLISHED_PORT`. A comunicação entre containers continua em `db:5432`. Isso elimina o conflito com o outro projeto local que usa 5432, preservando o volume existente.

Executar no backend: `pytest --ds=testing.settings -q`. Essa configuração mantém PostgreSQL e o fluxo real de autenticação, mas usa hash rápido exclusivamente nos testes. A suíte cobre clientes A/B, verbos de leitura/escrita, relacionamentos, promoção de cargos, suspensão, histórico e migração de dados antigos.

Frontend: as opções globais foram removidas, as rotas preservam a página ao normalizar o slug, e a sessão restaurada consulta a API antes de confiar no usuário salvo. Os testes de navegação com empresa passam. O build passa; permanecem seis falhas anteriores na suíte do frontend (Perfil, AdminUsuarios e NewAttendance), fora do escopo desta correção.

## Limites desta entrega

A correção não conclui a auditoria inteira: limites de planos sob concorrência, hash/throttling de PIN, recuperação de senha, política de revogação de tokens, dependências e configuração HTTPS continuam pendentes. A infraestrutura para identidades de plataforma separadas também não foi criada ainda.

Referência de implementação: [permissões e limitações das verificações por objeto no DRF](https://www.django-rest-framework.org/api-guide/permissions/). O isolamento cobre querysets e escrita, pois a permissão de objeto isoladamente não protege listagens ou criação.
