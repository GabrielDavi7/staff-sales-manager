# Auditoria da expansão multi-tenant

Data: 11/09/2026. Branch: `M3-IsolamentoPorCliente`. Commit analisado: `87584c8`.

**Conclusão: a branch ainda não oferece isolamento suficiente para comercialização com clientes independentes.** Há acesso cruzado a dados e escalada de privilégio reproduzidos. O problema principal está nas autorizações da API e na integridade dos vínculos; o slug no frontend não constitui uma barreira de segurança.

## Escopo e evidências

Analisados: autenticação, permissões, modelos, serializers, endpoints, analytics/exportações, administração Django, cadastro de clientes, scripts de migração de dados, configuração Docker/produção, navegação e testes React. Comparação com README e documentação de arquitetura/M1/M2/M3 no cofre UCE II. Não foi feita uma certificação de segurança, auditoria de infraestrutura remota nem busca exaustiva por CVEs.

As reproduções usaram dois clientes fictícios em SQLite em memória, Django 5.0.14 e DRF 3.15.2. Requisições passaram pela API com tokens reais de teste. As configurações de banco, e-mail e hash de senha foram substituídas apenas nesse processo. Nenhum registro real foi usado nas tentativas de acesso cruzado.

| Verificação | Resultado |
|---|---|
| Build frontend, dependências locais | Passou; aviso de bundle JS de aproximadamente 965 kB |
| Testes frontend | 31 passaram, 6 falharam, em 5 arquivos |
| ESLint | Não inicializa: `reactHooks.configs.flat.recommended` acessa propriedade inexistente |
| Testes backend em SQLite isolado | 109 passaram, 1 falhou |
| Migrações em banco vazio isolado | Aplicadas; `makemigrations --check --dry-run` não detectou mudanças |
| Django check no container | Sem problemas reportados |
| Testes pelo backend/PostgreSQL local | 110 erros de preparação por resolução de `db`; não equivalem a 110 bugs de aplicação |
| Migrações consultadas diretamente no PostgreSQL local | Migrações atuais de core/users/gestao aplicadas |
| Integridade local, consulta somente de contagens | 4 clientes; 1 usuário não ADMIN sem cliente; 0 lojas e métricas sem cliente; 0 divergências usuário/loja e usuário/equipe nas consultas realizadas |

O Docker local apresentou conflito: `alugon_db` já publica 5432. `joias_db` estava em execução sem rede, e a tentativa de conectar à rede `staff-sales-manager_default` com alias `db` falhou ao reservar essa porta. A consulta ao banco foi possível com psql dentro do próprio container. O problema de rede permaneceu pendente; não foram interrompidos containers de outros projetos.

## Bloqueadores de segurança

### 1. Crítico — administrador de cliente pode virar administrador global

Referências: `management/serializers.py:22`, `management/serializers.py:51`, `management/serializers.py:144`, `management/views.py:19`, `users/permissions.py:3`.

O campo `cargo` é gravável e aceita `ADMIN`, sem conferir o cargo de quem está solicitando. Um ADMIN_CLIENTE pode fazer PATCH no próprio usuário com `{"cargo":"ADMIN"}`. As permissões seguintes passam a tratá-lo como administrador de toda a API. Isso não exige obter `is_staff` ou `is_superuser`.

**Reprodução:** PATCH retornou 200; uma requisição subsequente listou os quatro usuários dos dois clientes fictícios. O formulário de criação no frontend também oferece ADMIN (`frontend/src/pages/admin/CriarUsuario.jsx:35`).

Correção: impedir criação/promoção de cargos de plataforma por administradores de cliente, inclusive alteração do próprio cargo, e separar explicitamente operações de plataforma das operações de tenant. Testar POST, PUT e PATCH.

### 2. Crítico — acesso e alteração de atendimentos de outro cliente

Referências: `core/views.py:61`, `core/views.py:83`, `core/views.py:135`, `core/views.py:149`, `core/views.py:159`.

Para ações diferentes de listagem, o queryset contém todos os relatórios. `get_object()` retorna imediatamente para ADMIN_CLIENTE; a checagem posterior de cliente fica inalcançável. Edição e exclusão também autorizam esse cargo. A criação busca vendedor globalmente, sem conferir tenant.

**Reprodução:** ADMIN_CLIENTE A consultou atendimento B por ID (200) e alterou valor de 100 para 222 (200). Exclusão e criação cruzada identificadas por inspeção do fluxo, sem executar exclusão.

Correção: escopo de tenant antes de resolver o objeto em todas as ações; validar vendedor e métrica contra o mesmo escopo. Responder 404/403 para objetos externos.

### 3. Alto — exportações e indicadores permitem leitura cruzada

Referências: `analytics/views.py:39`, `analytics/views.py:162`.

Exportação exige apenas autenticação e só verifica propriedade da loja quando o cargo é ADMIN_CLIENTE com cliente preenchido. Vendedor, supervisor e dispositivo podem fornecer ID de outra loja. No dashboard de loja, um supervisor também pode usar `loja_id` arbitrário: a checagem de tenant só contempla ADMIN_CLIENTE.

**Reprodução:** vendedor A exportou CSV da loja B com nome de cliente e valor de venda (200). Supervisor A acessou dashboard B com detalhes dos atendimentos (200).

Correção: aplicar a mesma política de leitura a listagem, indicadores e exportação. Vendedor fica limitado aos próprios registros; supervisor, à loja autorizada; dispositivo não recebe dados analíticos.

### 4. Alto — chaves estrangeiras permitem escrita em outro tenant

Referências: `management/serializers.py:8`, `management/serializers.py:161`, `management/serializers.py:197`, `management/serializers.py:228`, `core/serializers.py:19`.

Os campos de loja/equipe/cliente/métrica aceitam registros globais. Filtrar a listagem não protege o corpo de POST/PATCH. ADMIN_CLIENTE pode criar equipe numa loja externa; editar `cliente` de uma loja própria; criar métrica em outro cliente; vincular usuários a lojas/equipes incompatíveis. O vendedor de um relatório também permanece gravável na atualização: um vendedor pode tentar transferir relatório próprio a outro usuário.

**Reprodução:** criação de equipe pelo administrador A na loja B retornou 201. Demais variantes identificadas no código, sem testes individuais.

Correção: restringir querysets dos relacionamentos e validar a coerência completa do estado resultante. Campos de propriedade não podem ser controlados livremente pelo cliente HTTP.

### 5. Alto — falta de cliente abre acesso global

Referências: `management/views.py:24`, `analytics/views.py:110`, `core/views.py:35`, `core/views.py:176`.

O padrão `if cargo == ADMIN_CLIENTE and user.cliente` filtra somente quando o vínculo existe. Na ausência dele, mantém queryset global. O mesmo risco aparece na leitura de métricas para usuários sem cliente.

**Reprodução:** ADMIN_CLIENTE sem tenant recebeu todos os cinco usuários fictícios. O banco local contém um usuário não ADMIN sem cliente; seu cargo não foi exposto nem se afirma que ele explorou a falha.

Correção: usuário operacional sem cliente deve ter acesso negado. A exceção global precisa exigir privilégio explícito. Sanear dados legados antes de tornar vínculos obrigatórios.

### 6. Alto — middleware não aplica a proteção descrita

Referências: `gestao/middleware.py:22`, `config/settings.py:38`, `frontend/nginx.conf`.

`/api/` e `/admin/` são isentos. O middleware é executado antes de AuthenticationMiddleware; a autenticação por token ocorre posteriormente no DRF. As páginas React são servidas pelo Nginx/Vite, não passam pelo middleware Django. Portanto a comparação token/slug não protege as requisições de negócio.

Correção: resolver/validar o contexto do tenant após autenticação da API. Se usar domínio/slug, transportá-lo por um contrato explícito e conferir seu vínculo com o usuário. Não confiar no redirecionamento React.

### 7. Alto — desativação/expiração de cliente não bloqueia uso

Referências: `users/authentication.py:12`, `users/views.py:209`, `gestao/models.py:58`.

Login e autenticação verificam usuário/token, mas não `Cliente.ativo` ou `data_expiracao`. A filtragem de ativos no middleware isento não resolve isso. Desativar uma empresa não encerra seu acesso à API.

**Reprodução:** após desativar o cliente A, seu vendedor continuou recebendo 200 com token existente.

Correção: política central para tenant suspenso/expirado, aplicada no login e a cada requisição, com exceções explícitas para operações de plataforma.

### 8. Alto — onboarding do Django Admin ignora permissão de criação

Referência: `gestao/admin.py:25`.

A view `criar-completo/` é envolvida por `admin_site.admin_view`, mas não verifica `has_add_permission` nem permissões para criar usuários. Esse wrapper permite acesso a staff ativo; a view customizada precisa conferir as permissões adicionais. Um gerente staff de escopo reduzido pode alcançar diretamente esse cadastro. Achado por inspeção; não testado com sessão de staff.

Correção: exigir permissões específicas de plataforma para criação de cliente e administrador. Separar staff de tenant dos operadores do SaaS.

### 9. Alto — imagem Docker pode incorporar configuração de produção

Referências: `.dockerignore`, `Dockerfile:25`.

O Dockerfile copia todo o contexto. `.dockerignore` exclui `.env`, mas não `.env.prod` nem os demais `.env.*`. Existe `.env.prod` local; suas informações não foram abertas nem publicadas nesta auditoria. Uma imagem construída desse contexto pode carregar esse arquivo. `.gitignore` não protege o contexto Docker.

Correção: excluir arquivos de ambiente, bancos locais e artefatos de auditoria do contexto; revisar imagens já distribuídas. Não foi afirmado que uma imagem remota contém credenciais.

## Outros problemas que afetam comercialização

### 10. Alto — migração inicial pode reassociar todas as empresas

Referência: `gestao/management/commands/m1_setup_tenant.py:74` e `:111`.

A documentação do comando diz que aborta se já existir cliente, mas só confere o slug solicitado. Executá-lo novamente com outro slug atualiza TODAS as lojas e usuários para o novo cliente, inclusive os já vinculados. Não foi executado contra o banco local.

Correção: permitir apenas backfill de registros sem cliente, validar pré-condições e mostrar os impactos antes da aplicação. Impedir uso como rotina de onboarding.

### 11. Alto — senha fraca e tokens não revogados

Referências: `users/serializers.py:76`, `management/serializers.py:137`, `users/views.py:185`, `core/views.py:112`, `users/models.py:33`.

A troca de senha do perfil e cadastro administrativo não executam os validadores de senha configurados. Alterar/resetar senha não revoga tokens DRF existentes. PIN de quatro dígitos é armazenado em texto simples e retornado pelo serializer administrativo; não há limitação de tentativas configurada na aplicação para PIN/login/reset. Não foi verificada proteção externa de proxy.

**Reprodução:** perfil aceitou nova senha `1` (200) e o token anterior permaneceu válido (200).

Correção: validação consistente, política de revogação de sessão, hash do PIN, não retorná-lo nas listagens e controle de tentativas. Token DRF não perde validade automaticamente quando a senha muda.

### 12. Médio — limites de planos são contornáveis

Referência: `management/serializers.py:66`, `:73`, `:172`, `:202`.

Só há validação de criação, não de reativação/transferência/alteração de cargo. Sem loja, os limites de usuário são ignorados — inclusive o de ADMIN_CLIENTE, que pode legitimamente não ter loja. `max_usuarios_total` é definido e exibido mas não aplicado. Contagem seguida de criação não tem proteção contra concorrência. Um cliente informado no payload de criação de loja pode orientar a validação, enquanto `perform_create` salva outro cliente.

Correção: serviço único que valide o estado final e o tenant efetivo, com transação e bloqueio apropriados, cobrindo todos os caminhos de escrita. Definir semântica de usuários inativos e planos sem limite.

### 13. Médio — histórico muda quando vendedor muda de loja

Referências: `core/models.py:48`, `core/views.py:75`, `analytics/views.py:111`, `analytics/services.py:86`.

O atendimento guarda vendedor, mas não o tenant/loja do momento do atendimento. O isolamento e os indicadores derivam da loja atual do vendedor. Transferir uma pessoa muda retroativamente a atribuição de seus relatórios; uma transferência entre tenants pode deslocar dados históricos de uma empresa para outra. Excluir o usuário no admin pode excluir seus atendimentos por CASCADE.

Correção: definir propriedade estável do atendimento e política de transferência/exclusão. Migração precisa preservar o histórico existente e tratar registros inconsistentes.

### 14. Médio — redirecionamento remove segmentos válidos

Referência: `frontend/src/routes.jsx:37` e `:44`.

O primeiro segmento é tratado como slug mesmo quando é uma rota normal. Para ADMIN sem cliente, `/adminpainel` vira `/`; `/meuperfil` também vira `/`. Para usuário com tenant, `/graficos` vira `/<slug>/`, perdendo a página solicitada.

Correção: usar parâmetros da rota casada e localização do Router, distinguindo rota sem slug de rota com slug. Existe também um roteador legado em `frontend/src/routes/index.jsx`; a aplicação importa `./routes`, correspondente ao arquivo `routes.jsx` nesta build. Consolidar a definição para evitar manutenção no arquivo errado.

### 15. Médio — cadastro completo pode deixar empresa sem administrador

Referências: `gestao/forms.py:36`, `:45`, `:51`, `gestao/models.py:68`.

O formulário valida slug de cliente/e-mail, mas usa slug como username sem verificar colisão com usuário existente. Cliente é criado antes do usuário, sem transação. Domínio duplicado também não recebe validação específica no formulário. Além disso, `Cliente.__str__` acessa `plano.nome`, embora plano seja opcional, quebrando telas que representam um cliente sem plano.

**Reprodução:** slug igual ao username de um vendedor passou na validação; criação levantou IntegrityError e deixou o cliente órfão persistido no banco de teste.

Correção: operação atômica, validação de unicidade e representação tolerante a plano ausente.

### 16. Médio — PATCH de atendimento usa apenas campos enviados

Referência: `core/serializers.py:64`.

PATCH apenas de observações em uma venda fechada é interpretado como atendimento não concretizado, pois `venda_fechada` ausente vira None e a validação exige métrica. Deve validar estado efetivo combinando instância e campos enviados. Mudanças entre venda/não venda precisam limpar os campos incompatíveis de modo consistente.

### 17. Médio — exportação interpreta conteúdo como fórmula

Referência: `analytics/views.py:228` e `:286`.

Nome de cliente/observações e outros textos são exportados diretamente. Em XLSX, texto iniciado por `=` pode ser escrito como fórmula; CSV pode ser interpretado como fórmula pelo programa que o abre. Achado por inspeção, sem executar arquivo malicioso.

Correção: gravar texto como texto e neutralizar prefixos de fórmula no formato exportado, preservando valores numéricos legítimos. Exportação também usa `strftime` sem conversão para fuso local: na reprodução, API exibiu 12:09 e CSV 15:09.

### 18. Médio — listagens globais e consultas sem limite

Referências: `core/views.py:17`, `analytics/services.py:81`.

Vendedores/supervisores/dispositivos recebem todas as lojas ativas porque só ADMIN_CLIENTE é filtrado. Reproduzida listagem A+B por vendedor A. Analytics materializa todos os atendimentos em `list(tabela_atendimentos)`, apesar do comentário mencionar vinte; grandes históricos crescem em memória, tempo de resposta e transferência. IDs inválidos/datas impossíveis também carecem de validação consistente antes das queries.

Correção: filtrar catálogo por escopo, paginar detalhes no servidor e validar parâmetros. Agregações de vendedores/lojas agrupadas por nome devem incluir identificadores, evitando juntar homônimos.

### 19. Alto para produção — transporte e dependência sem suporte

Referências: `config/settings.py:132`, `docker-compose.prod.yml`, `requirements.txt:2`.

Configuração de produção mantém redirecionamento HTTPS e cookies seguros desligados, publica backend e banco, e traz URL padrão HTTP no build do frontend. Isso deixa tokens/sessões sem proteção de transporte se implantado como está. Uma infraestrutura TLS externa não foi examinada.

Django está restrito a 5.0.x, cujo suporte estendido terminou em 02/04/2025, conforme a [tabela oficial do Django](https://www.djangoproject.com/download/). Não se afirma uma CVE específica; a restrição impede receber correções das séries suportadas. Dependências Python sem lock tornam builds menos reproduzíveis.

Correção: revisar TLS/proxy e portas publicadas; migrar para série suportada com testes de compatibilidade; fixar dependências resolvidas.

### 20. Médio — recuperação de senha e perfil incompletos

Referências: `users/views.py:150`, `frontend/src/routes.jsx`, `users/serializers.py:21`, `frontend/src/contexts/AuthContext.jsx:78`, `frontend/src/pages/dashboard/perfil.jsx:143`.

E-mail aponta para `http://localhost:5173/nova-senha/...`, sem rota correspondente no frontend. Link não funciona como recuperação em produção. Perfil espera função `setUser` que o provider não fornece; como há uma guarda `typeof`, a atualização salva no backend mas o contexto fica desatualizado. `/user/me/` também tem contrato diferente do login e omite metadados do tenant/plano.

Correção: URL configurável e fluxo completo de recuperação; contrato de usuário consistente e atualização de contexto/storage após edição. Não é necessário devolver PIN para corrigir o formulário.

## Documentação e testes

- M1/M2/M3 continuam marcados como planejamento 0%, apesar de implementação parcial. Isso esconde pendências reais e confunde funcionalidades presentes com verificadas.
- O planejamento define SUPORTE como operador global; o código não possui esse cargo e usa ADMIN. Decidir nomenclatura e poderes antes de expandir o painel da plataforma.
- M3 prevê filtro por `vendedor__cliente`; a implementação usa `vendedor__loja__cliente`. É uma diferença de propriedade, não apenas de sintaxe.
- README ainda descreve React 18 (manifesto usa 19), permissões em local planejado e componentes/rotas já implementados. A configuração real lê POSTGRES_*, não DATABASE_URL.
- O comando de teste de M3 cita pastas `core/tests/` etc.; no repositório os testes são arquivos `tests.py`.
- A suíte backend existente não instancia Cliente/ADMIN_CLIENTE nos testes analisados. Os 109 testes que passaram não demonstram isolamento entre tenants.
- Falha backend isolada: `MetricaViewSetTests.test_listagem_usuario_sem_loja`, esperava 1 e recebeu 3 métricas.
- Falhas frontend: 3 em Perfil, 1 em AdminUsuarios e 2 em NewAttendance. Foram observados labels sem associação adequada nos testes de senha, expectativa de erro no cadastro e erros de rede nos mocks do atendimento. Não se deve converter automaticamente toda falha de teste em bug de produção.

## Sequência de correção proposta

1. **Conter os acessos indevidos:** bloquear promoção a ADMIN; tenant obrigatório para cargos operacionais; escopo único para objetos, relacionamentos, indicadores e exportações. Criar testes com clientes A e B para todos os verbos HTTP e cargos.
2. **Consolidar identidade e propriedade:** definir ADMIN/SUPORTE/gerentes da plataforma; corrigir suspensão, autenticação, onboarding, integridade e histórico dos atendimentos.
3. **Aplicar regras comerciais:** limites transacionais em criação/edição/reativação; política de plano e expiração; proteção dos comandos de backfill.
4. **Restabelecer fluxos e qualidade:** rotas, recuperação/perfil, PATCH parcial, lint, mocks e testes; atualizar documentação para refletir o que foi verificado.
5. **Preparar implantação:** dependências suportadas, TLS, segredos fora da imagem, portas privadas, paginação e rastreabilidade das ações administrativas.

Para o ambiente local, remover a publicação externa de 5432 ou usar uma porta alternativa (ex.: 5433 no host) resolve o conflito com o outro projeto; entre containers o destino deve continuar sendo `db:5432`. Recriar apenas o serviço db preservando o volume, depois conferir a conexão e repetir testes com PostgreSQL. Nenhum reset de volume é necessário.

Critério mínimo antes de atender empresas independentes: nenhum cargo de cliente obtém acesso global; todos os testes de acesso cruzado negam leitura/escrita/exportação; tenant ausente ou suspenso é bloqueado; vínculos e migrações são consistentes; testes e build passam em ambiente reproduzível.

## Alterações realizadas nesta auditoria

Foi adicionado este relatório. Código funcional e dados do banco local não foram alterados. As reproduções/dependências auxiliares ficaram em `.audit_runtime`, ignorada pelo Git; build gerou `frontend/dist`, também ignorado. Houve uma tentativa malsucedida de reconectar a rede Docker. As correções propostas acima ainda precisam ser implementadas.
