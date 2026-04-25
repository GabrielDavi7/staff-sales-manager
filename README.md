# 💍 Staff Sales Manager

Sistema de gerenciamento de atendimentos para lojas de joias.
Permite que vendedores registrem atendimentos e acompanhem seu desempenho,
supervisores monitorem as atividades da loja e administradores gerenciem
usuários, lojas, equipes e métricas do negócio.

Desenvolvido com **Django REST Framework** (backend) e **React + Vite** (frontend),
utilizando Docker para ambiente de desenvolvimento padronizado.

## 🛠️ Tecnologias

### Backend
- [Python 3.12+](https://www.python.org/)
- [Django 5.0](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/) (TokenAuthentication)
- [PostgreSQL 16](https://www.postgresql.org/)
- [pytest](https://docs.pytest.org/) + [pytest-django](https://pytest-django.readthedocs.io/) para testes automatizados da API
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers)

### Frontend
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router 6](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

### Infraestrutura
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

## 📁 Estrutura de Diretórios

### Raiz do Projeto (Backend Django)

```bash
staff-sales-manager/ # Pasta raiz (contém o backend e o frontend)
├── config/ # Configurações centrais do Django
│ ├── settings.py # Configurações gerais, banco de dados, apps instalados, CORS, DRF
│ └── urls.py # URLs raiz da API (inclui as URLs de cada app)
├── core/ # App principal: modelos de negócio
│ └── models.py # Modelos: Loja, Equipe, Métrica, Relatório (Atendimento)
├── users/ # App de identidade e autenticação
│ └── models.py # Modelo CustomUser (cargos: ADMIN, SUPERVISOR, VENDEDOR)
├── analytics/ # App de relatórios e métricas de desempenho
│ └── views.py # Endpoints agregados (dashboards, estatísticas)
├── management/ # App de administração do sistema
│ └── urls.py # Rotas administrativas (gestão de lojas, usuários, métricas)
├── .env # Variáveis de ambiente (credenciais, chaves)
├── .env.example # Exemplo de variáveis de ambiente (não versionado com secrets)
├── docker-compose.yml # Orquestra os serviços: backend, frontend, banco de dados
├── Dockerfile # Receita para a imagem do backend Django
├── manage.py # Utilitário de linha de comando do Django
├── requirements.txt # Dependências Python do backend
└── frontend/ # Subpasta do frontend React (detalhada em seção separada)
```

### 🧩 Função de cada App

- **core**: Contém todos os modelos de negócio da aplicação (`Loja`, `Equipe`, `Metrica`, `Relatorio`).  
  Além dos modelos, é aqui que estão as views responsáveis pelo CRUD de atendimentos, métricas e entidades relacionadas.  
  **Permissões e segurança:** as operações são automaticamente filtradas conforme o cargo do usuário autenticado:
  - *Dispositivo* pode criar atendimentos em nome de qualquer vendedor da sua loja. 
  - *Vendedor* vê e cria apenas seus próprios atendimentos.
  - *Supervisor* visualiza dados de toda a sua loja.
  - *Admin* tem acesso irrestrito a todos os registros.  
  Qualquer alteração na estrutura de dados principal deve ser feita neste app.

- **users**: Responsável pelo modelo de usuário personalizado (`CustomUser`), que estende o usuário padrão do Django com os campos `cargo`, `loja` e `equipe`.  
  A autenticação e o gerenciamento de usuários partem daqui, incluindo as escolhas de cargo: `ADMIN`, `SUPERVISOR` e `VENDEDOR`.

- **analytics**: App dedicado exclusivamente a **consultas analíticas e dashboards**.  
  **Não possui modelos próprios**; ele consulta os modelos do `core` e `users` para agregar dados e gerar métricas de desempenho.  
  Aplica automaticamente filtros de permissão baseados no cargo, garantindo que:
  - Vendedores vejam apenas seu próprio desempenho.
  - Supervisores vejam métricas consolidadas da sua loja.
  - Admins acessem a visão global.  
  Esse app é a base para os dashboards individuais, de loja e geral.

- **management**: Centraliza funcionalidades administrativas do sistema, como CRUD de lojas, usuários e métricas globais.  
  Acessível exclusivamente por usuários com cargo `ADMIN`, suas URLs são incluídas nas rotas principais da API.

### Frontend (React + Vite)

```bash
frontend/
├── Dockerfile                  # Imagem Node para desenvolvimento
├── package.json                # Dependências e scripts
├── vite.config.js              # Configuração do Vite
└── src/
    ├── api/
    │   └── axios.js            # Instância do Axios com URL base, interceptadores de token
    ├── components/             # Componentes reutilizáveis
    │   ├── Button/             # Botão com variantes e tamanhos
    │   ├── Card/               # Cartão para conteúdos diversos
    │   ├── Input/              # Campo de texto com label e erro
    │   └── Navbar.jsx          # Barra de navegação superior condicional ao cargo
    ├── contexts/
    │   └── AuthContext.jsx     # Estado global de autenticação (login, logout, token, usuário)
    ├── pages/
    │   ├── Login/              # Tela de login
    │   └── dashboard/          # Páginas protegidas do dashboard
    │       ├── DashboardLayout.jsx  # Layout com Navbar + Outlet
    │       ├── Home.jsx             # Página inicial com exemplos
    │       ├── RegistrarAtendimento.jsx (planejado)
    │       ├── MeuDesempenho.jsx (planejado)
    │       └── AdminPanel.jsx (planejado)
    ├── routes/
    │   └── PrivateRoute.jsx    # Protege rotas que exigem login
    ├── styles/
    │   ├── theme.css           # Variáveis globais de cores, fontes e espaçamentos
    │   ├── global.css          # Reset e estilos base
    │   └── navbar.css          # Estilos específicos da Navbar
    └── utils/
        └── permissions.js      # Define links da Navbar e funções de permissão por cargo
```

### 🧩 Função de cada item (frontend)

- **api/axios.js**: Centraliza a comunicação com o backend. Inclui automaticamente o token de autenticação nas requisições.
- **components/**: Componentes reutilizáveis estilizados com as variáveis CSS do tema. Mantêm a consistência visual em toda a aplicação.
- **contexts/AuthContext.jsx**: Provedor de contexto que armazena o token, dados do usuário logado e funções de login/logout, disponível para toda a aplicação.
- **pages/**: Cada subpasta representa uma tela completa. As páginas do dashboard são carregadas dentro do `DashboardLayout`, que já possui a Navbar.
- **routes/PrivateRoute.jsx**: Verifica se o usuário está autenticado; caso contrário, redireciona para `/login`.
- **styles/**: Contém as definições de tema (cores, fontes) e estilos globais, importados no ponto de entrada da aplicação.
- - **utils/permissions.js**: Centraliza as regras de acesso baseadas no cargo do usuário.
  Fornece funções para montar a Navbar condicional e para validar se um usuário pode acessar determinada rota.
  Serve como camada de conveniência no frontend, enquanto a segurança efetiva é aplicada no backend.

## 🗃️ Modelos de Dados

Todos os modelos estão definidos nos apps `core` e `users`. O app `analytics` não possui modelos próprios; ele apenas consulta os modelos existentes para gerar relatórios e dashboards.

### `core` – Modelos de Negócio

#### Loja
| Campo   | Tipo         | Descrição               |
|---------|--------------|-------------------------|
| `nome`  | CharField    | Nome da loja            |
| `cidade`| CharField    | Cidade onde a loja está |

#### Equipe
| Campo | Tipo       | Descrição                         |
|-------|------------|-----------------------------------|
| `nome`| CharField  | Nome da equipe                    |
| `loja`| ForeignKey | Loja à qual a equipe pertence     |

#### Metrica
| Campo       | Tipo       | Descrição                                    |
|-------------|------------|----------------------------------------------|
| `nome`      | CharField  | Nome da métrica (ex: "Preço", "Não atende")  |
| `descricao` | TextField  | Detalhamento opcional                        |
| `loja`      | ForeignKey | Loja associada (opcional)                    |

#### Relatorio (Atendimento)
| Campo          | Tipo         | Descrição                                                                 |
|----------------|--------------|---------------------------------------------------------------------------|
| `data_hora`    | DateTime     | Data e hora do atendimento (padrão: momento atual)                        |
| `venda_fechada`| Boolean      | Se a venda foi concluída                                                  |
| `valor_venda`  | Decimal      | Valor da venda (obrigatório se `venda_fechada=True`)                      |
| `vendedor`     | ForeignKey   | Vendedor que realizou o atendimento (referencia `users.CustomUser`)       |
| `metrica`      | ForeignKey   | Métrica associada (obrigatório se `venda_fechada=False`)                  |

**Regras de negócio implementadas no modelo:**
- Se `venda_fechada=True`, `valor_venda` é obrigatório e `metrica` deve ficar em branco.
- Se `venda_fechada=False`, `metrica` é obrigatória (motivo da não venda) e `valor_venda` fica em branco.
- Essas validações são executadas no método `clean()` e chamadas automaticamente pelo `save()`, garantindo integridade no banco.

**Observação sobre o dispositivo compartilhado:**  
Quando o atendimento é registrado por um usuário do cargo `DISPOSITIVO`, o campo `vendedor` é preenchido com o vendedor real escolhido no formulário. O dispositivo nunca é registrado como vendedor do atendimento. As permissões do backend garantem que um dispositivo só possa criar atendimentos para vendedores da sua própria loja.

### `users` – Modelo de Usuário

#### CustomUser (herda AbstractUser)
| Campo        | Tipo       | Descrição                                      |
|--------------|------------|------------------------------------------------|
| `username`   | CharField  | Identificador único (usado para login rápido)  |
| `email`      | EmailField | E-mail (usado como credencial principal)       |
| `cargo`      | CharField  | ADMIN, SUPERVISOR, VENDEDOR ou DISPOSITIVO     |
| `loja`       | ForeignKey | Loja onde o usuário trabalha (opcional)        |
| `equipe`     | ForeignKey | Equipe do usuário (opcional)                   |

**Observação:** O campo `USERNAME_FIELD` é definido como `'email'`, portanto o login na API é feito com e-mail e senha.

**Cargo `DISPOSITIVO`**: representa um dispositivo compartilhado (ex: tablet da loja).  
- Pode criar atendimentos em nome de qualquer vendedor da sua loja.  
- Não acessa dashboards, análises ou administração.  
- Garante a rastreabilidade individual dos atendimentos sem exigir login constante de cada vendedor.

### `analytics` – Sem modelos próprios

O app `analytics` não define novas tabelas. Ele atua como camada de **consultas agregadas** que:
- Lê dados de `Relatorio`, `Metrica`, `CustomUser`, `Loja` e `Equipe`.
- Fornece endpoints de leitura para dashboards de vendedor (desempenho individual), supervisor (métricas da loja) e admin (visão geral).
- Não realiza operações de escrita (criação/edição de atendimentos é feita via `core`).

## 📋 Pré-requisitos

Para executar o projeto localmente, você precisará de:

- [Docker](https://docs.docker.com/get-docker/) (versão 20.10 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0 ou superior)

> **Nota:** Python e Node.js não precisam estar instalados na máquina host, pois o ambiente é totalmente containerizado com Docker. As dependências são resolvidas dentro dos containers.

## ⚙️ Configuração Inicial

1. **Clone o repositório:**
```bash
   git clone <https://github.com/GabrielDavi7/staff-sales-manager>
   cd staff-sales-manager
```

2. **Configure as variáveis de ambiente:**
    Copie o arquivo de exemplo:
```bash
    cp .env.example .env
```

Edite o arquivo .env e preencha as variáveis obrigatórias:

- SECRET_KEY: chave secreta do Django
- DEBUG: True para desenvolvimento, False para produção
- DATABASE_URL: URL de conexão com o PostgreSQL (já pré-configurada para o container)
- ALLOWED_HOSTS: hosts permitidos (ex: localhost,127.0.0.1)

O arquivo .env.example contém valores de exemplo para desenvolvimento local. Em produção, utilize valores seguros e nunca versione o .env.

3. **Suba os containers:**

```bash
    docker-compose up -d
```

Isso iniciará:

- Banco de dados PostgreSQL (porta 5432)
- Backend Django (porta 8000)
- Frontend React (porta 5173)

4. **Aplique as migrações e crie o superusuário:**

```bash
    docker exec -it joias_backend python manage.py makemigrations
    docker exec -it joias_backend python manage.py migrate
    docker exec -it joias_backend python manage.py createsuperuser
```

> **Nota:** O comando `makemigrations` analisa os modelos e gera os arquivos de migração. O `migrate` aplica essas migrações ao banco de dados. Se os arquivos de migração já estiverem versionados no repositório, o `makemigrations` não fará alterações, mas é seguro executá-lo.

5. **Acesse a aplicação:**

- Frontend: http://localhost:5173
- API Backend: http://localhost:8000/api/

## 🚀 Lista de Comandos para Desenvolvedores

```markdown

## 📟 Comandos para Desenvolvedores

### Ambiente Docker

| Ação | Comando |
|------|---------|
| Subir todos os serviços | `docker-compose up -d` |
| Parar todos os serviços | `docker-compose down` |
| Parar e remover volumes (resetar banco) | `docker-compose down -v` |
| Reconstruir uma imagem | `docker-compose build <serviço>` |
| Ver logs do Backend | `docker logs -f joias_backend`  |
| Ver logs do Banco   | `docker logs -f joias_db`       |
| Ver logs do Front   | `docker logs -f joias_frontend` |
| Acessar o shell do container | `docker exec -it joias_backend sh` |

### Backend (Django)

| Ação | Comando |
|------|---------|
| Criar migrações | `docker exec -it joias_backend python manage.py makemigrations` |
| Aplicar migrações | `docker exec -it joias_backend python manage.py migrate` |
| Criar superusuário | `docker exec -it joias_backend python manage.py createsuperuser` |
| Rodar testes | `docker exec -it joias_backend pytest` |
| Shell Django | `docker exec -it joias_backend python manage.py shell` |

### Frontend (React)

| Ação | Comando |
|------|---------|
| Instalar nova dependência | `docker exec -it joias_frontend npm install <pacote>` |
| Rodar build de produção | `docker exec -it joias_frontend npm run build` |
| Ver logs do Vite | `docker logs -f joias_frontend` |

### Docker – Comandos de Manutenção

| Ação | Comando |
|------|---------|
| Listar containers ativos | `docker ps` |
| Remover containers parados | `docker container prune` |
| Remover imagens não usadas | `docker image prune` |

```

## 🔄 Fluxo de Desenvolvimento

### 🔗 Configuração de URLs (Backend)

As URLs raiz da API são definidas em `config/urls.py`. Cada app possui seu próprio arquivo `urls.py` (ex: `core/urls.py`, `management/urls.py`) e é incluído na raiz com `include()`.

Para adicionar um novo grupo de endpoints:

1. Crie ou edite o arquivo `urls.py` dentro do app responsável (ex: `core/urls.py` para CRUD de atendimentos).
2. Defina as rotas usando `path()` ou `DefaultRouter` (se utilizar ViewSets).
3. Em `config/urls.py`, inclua as novas URLs:

**Exemplo conceitual:**  
O app `management` centraliza rotas administrativas (`/api/admin/...`) acessíveis apenas por ADMIN. O app `core` expõe `/api/atendimentos/...` e endpoints similares.

### 📦 Importação de Models entre Apps

Todos os modelos de negócio estão no app `core`. Outros apps (ex: `analytics`, `management`) podem importar esses modelos normalmente:

```bash
from core.models import Relatorio, Loja, Metrica
```

Da mesma forma, o modelo de usuário personalizado é importado com:

```bash
from django.conf import settings
User = settings.AUTH_USER_MODEL
```


**Boas práticas:**
- Evite importar models de um app que não seja `core` ou `users` em outros apps, para não criar acoplamento desnecessário.
- Se um app precisar consultar dados, prefira fazê-lo via `core.models`, nunca duplicando definições.

### 🧱 Serializers e Views (Visão Geral)

**Serializers** (Django REST Framework) convertem dados entre objetos Python e JSON. Cada modelo principal possui um serializer correspondente (normalmente em `serializers.py` dentro do app).

**Views** processam as requisições e utilizam os serializers para validar e retornar dados.
- Para CRUD, recomenda-se `ModelViewSet` ou `ListCreateAPIView` / `RetrieveUpdateDestroyAPIView`.
- Para endpoints analíticos (app `analytics`), utiliza-se `APIView` simples com métodos `get()`.

**Validações de negócio** são aplicadas tanto no modelo (método `clean()`) quanto nos serializers (`validate()`), garantindo integridade antes da persistência.

### 🔒 Classes de Permissão

As permissões são verificadas nas views para restringir acesso conforme o cargo do usuário. Classes reutilizáveis estão previstas em `core/permissions.py` (ex: `IsAdmin`, `IsSupervisorOrAdmin`, `IsVendedor`).  
Elas funcionam em conjunto com a filtragem de queryset, onde cada view limita os dados retornados de acordo com o `request.user.cargo`.

**Regra geral:**
- Endpoints de administração exigem `IsAdmin`.
- Endpoints de analytics para loja exigem `IsSupervisorOrAdmin`.
- Endpoints pessoais (vendedor) podem usar `IsVendedor` e filtrar por `vendedor=request.user`.

### 🖥️ Adicionar uma nova página (Frontend)

Organização recomendada: cada funcionalidade ou tela fica em uma subpasta dentro de `pages/`, contendo o componente principal e seu CSS opcional.

**Passos:**

1. Crie a pasta, por exemplo `pages/RegistrarAtendimento/`.
2. Adicione `RegistrarAtendimento.jsx` e, se necessário, `RegistrarAtendimento.css`.
3. No `App.jsx`, importe o componente e adicione a rota dentro do grupo protegido:

```bash
    import RegistrarAtendimento from './pages/RegistrarAtendimento/RegistrarAtendimento';
```

Dentro de `<Routes>`:

```bash
    <Route path="registrar" element={<RegistrarAtendimento />} />
```

O caminho relativo `"registrar"` se tornará `/dashboard/registrar`.
4. Para controlar a exibição na Navbar, atualize o array em `utils/permissions.js`, adicionando o link apenas para os cargos desejados.
5. Para proteger rotas por cargo (além do `PrivateRoute`), utilize o componente `RoleRoute` (planejado) que valida `user.cargo` antes de renderizar.

### 📦 Instalar dependências

- **Backend**: execute dentro do container e depois atualize o `requirements.txt` se for uma dependência permanente.

```bash
    docker exec -it joias_backend pip install <pacote>
```

- **Frontend**: instale com npm dentro do container. O `package.json` é atualizado automaticamente.

```bash
    docker exec -it joias_frontend npm install <pacote>
```

### ✅ Boas práticas

- Escreva testes para novas funcionalidades (pytest no backend) e execute antes de abrir PRs.
- Mantenha o README atualizado sempre que a estrutura de pastas ou comandos mudar.
- Respeite as responsabilidades de cada app: lógica de negócio no `core`, análises no `analytics`, administração no `management`.
- No frontend, reutilize os componentes de `components/` (Button, Card, Input) para manter consistência visual.

## 🤝 Contribuição

### Fluxo de trabalho

1. **Issues**: Antes de iniciar uma tarefa, verifique se já existe uma issue aberta. Caso contrário, crie uma descrevendo o objetivo, o contexto e os critérios de aceitação.
2. **Branches**: Crie uma branch a partir de `main` (ou `develop`) seguindo o padrão:
   - `feature/nome-da-funcionalidade` para novas funcionalidades
   - `fix/nome-do-bug` para correções
   - `docs/nome-do-documento` para alterações de documentação
3. **Commits**: Mantenha commits atômicos e com mensagens descritivas (ex: `Adiciona endpoint de métricas do vendedor`).
4. **Pull Requests**: Ao finalizar, abra um PR descrevendo as alterações e vinculando a issue correspondente. Solicite revisão de pelo menos um outro desenvolvedor.
5. **Revisão**: Após aprovação, faça o merge e delete a branch.

### Padrões de código

- **Backend**: Siga PEP8. Utilize docstrings em funções e classes públicas.
- **Frontend**: Mantenha componentes funcionais e hooks. Prefira CSS Modules ou co-localização de estilos.
- **Testes**: Todos os endpoints e regras de negócio devem possuir testes automatizados (pytest). Execute `pytest` antes de abrir um PR.
