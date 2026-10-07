# Isolamento da API das empresas

Implementado na branch M3-IsolamentoPorCliente. `ADMIN` mantém o nome original e representa o administrador de uma empresa. Ele não concede acesso global à API. A tabela e a autenticação separadas dos administradores do SaaS, assim como o novo painel, ficam para uma próxima etapa.

## Regras

| Identidade | Acesso |
|---|---|
| ADMIN com empresa ativa | Dados e cadastros da própria empresa; registro para vendedores autorizados |
| SUPERVISOR | Indicadores/atendimentos da própria loja; sem alteração de atendimentos |
| VENDEDOR | Seus atendimentos e exportações; sem transferência do vendedor do registro |
| DISPOSITIVO | Registro para vendedor ativo da própria loja mediante PIN; sem indicadores/exportações |
| Sem cliente, cliente inativo/expirado ou vínculos inconsistentes | Acesso à API negado |

Staff/superusuário não concede exceção à API. Temporariamente, `/admin/` aceita apenas superusuário staff ativo **sem empresa**, para manutenção. O Unfold usa o AdminSite restrito. Contas de clientes não podem entrar nesse painel, mesmo se possuírem flags de staff.

O backend filtra listagens, detalhes, alterações, indicadores e exportações pelo escopo compartilhado em `users/tenant.py`. IDs fora do escopo retornam 404; vínculos inválidos no payload retornam 400. Uma autenticação válida com vínculo de empresa inválido retorna 403.

ADMIN não cria nem promove administradores, não altera outro administrador e não rebaixa/desativa a própria conta. Essas operações ficam na manutenção. Campos de staff/grupos/permissões e mudanças de empresa são rejeitados. PIN não aparece na listagem administrativa.

## Preservação de dados e migrações

- `users.0005_remove_global_role`: o nome do arquivo permanece por compatibilidade com o histórico da branch, mas a versão atual **não altera dados de usuários**. Ela apenas mantém `ADMIN` como cargo da empresa no estado das migrações. Contas ADMIN sem empresa permanecem no banco, porém não entram na API de clientes.
- `core.0006_report_ownership`: adiciona empresa e loja do atendimento e preenche apenas quando os vínculos antigos são coerentes. Preserva ID, vendedor, valores e demais dados. Registros ambíguos ficam sem propriedade e invisíveis na API até saneamento explícito; não são atribuídos por suposição.
- Atendimentos existentes não podem trocar vendedor/empresa/loja. Novos atendimentos recebem a empresa e loja do vendedor autorizado. Transferência do vendedor para outra loja da mesma empresa não altera os relatórios antigos.
- Transferências de usuário/loja entre empresas e de equipe/métrica entre lojas são bloqueadas nas gravações normais. Exclusão de vendedor/loja/empresa referenciada por histórico é protegida.
- As validações de modelo não substituem uma política para SQL direto ou `QuerySet.update`: os comandos administrativos devem respeitá-las. O backfill inicial agora aborta se houver qualquer cliente; o seed de demonstração só roda em banco vazio e em transação.

O banco local de testes recebeu uma versão anterior de `users.0005` que convertia cargos. Como esse arquivo já foi aplicado ali, editar o arquivo não reverte os dados desse banco. Antes de usar um banco que tenha aplicado a versão anterior, verifique os cargos nele e planeje a correção dos registros afetados. No sistema em produção, confirme as migrações já aplicadas antes de concluir que nenhuma migração de esquema será necessária. A versão atual desta branch não inclui conversão de dados para o cargo ADMIN.

## Ambiente e validação

O PostgreSQL de desenvolvimento publica `127.0.0.1:5433` por padrão, configurável com `POSTGRES_PUBLISHED_PORT`. A comunicação entre containers continua em `db:5432`. Isso elimina o conflito com o outro projeto local que usa 5432, preservando o volume existente.

Executar no backend: `pytest --ds=testing.settings -q`. Essa configuração mantém PostgreSQL e o fluxo real de autenticação, mas usa hash rápido exclusivamente nos testes. A suíte cobre clientes A/B, verbos de leitura/escrita, relacionamentos, promoção de cargos, suspensão, histórico e migração de dados antigos.

Frontend: as opções globais foram removidas, as rotas preservam a página ao normalizar o slug, e a sessão restaurada consulta a API antes de confiar no usuário salvo. Os testes de navegação com empresa passam. O build passa; permanecem seis falhas anteriores na suíte do frontend (Perfil, AdminUsuarios e NewAttendance), fora do escopo desta correção.

O cadastro de Cliente no Django Admin também voltou a renderizar. A instalação atual usa Django 5.0 com Unfold; `gestao/unfold_compat.py` normaliza o contexto aninhado recebido pelos componentes do Unfold nessa versão do Django. O ajuste é ativado apenas no Django 5.0 e deve ser reavaliado ao atualizar o framework.

## Limites desta entrega

A correção não conclui a auditoria inteira: limites de planos sob concorrência, hash/throttling de PIN, recuperação de senha, política de revogação de tokens, dependências e configuração HTTPS continuam pendentes. A infraestrutura para identidades de plataforma separadas também não foi criada ainda.

Referência de implementação: [permissões e limitações das verificações por objeto no DRF](https://www.django-rest-framework.org/api-guide/permissions/). O isolamento cobre querysets e escrita, pois a permissão de objeto isoladamente não protege listagens ou criação.
