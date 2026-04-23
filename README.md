# 📂 Estrutura do Backend (Django)

O backend foi estruturado seguindo o princípio da **Responsabilidade Única**, permitindo que o sistema cresça sem criar dependências confusas entre os setores da empresa.

## 🏛️ Divisão por Aplicações (Apps)

### `users` (Identidade e Acesso)
- **Função:** Central de usuários do ecossistema.
- **Diferencial:** Diferente de um vendedor comum, este app permite a existência de usuários "Transversais" (como Supervisores e Administradores) que possuem credenciais de acesso mas não estão obrigatoriamente vinculados a uma única loja física.
- **Responsabilidade:** Gerenciar o `CustomUser`, fluxos de login e permissões de segurança.

### `core` (Estrutura de Negócio)
- **Função:** Mapeamento físico e lógico da Joias Centro.
- **Entidades:** `Loja`, `Equipe` e `Metrica`.
- **Responsabilidade:** Definir os locais de trabalho e os parâmetros de avaliação (métricas) que serão usados nos relatórios.

### `analytics` (Operação e Performance)
- **Função:** Motor de processamento de dados.
- **Responsabilidade:** Registrar cada interação de venda (`Relatórios`) e vincular o `User` (do app `users`) à `Metrica` (do app `core`), gerando a base histórica para o dashboard.

### `management` (Backoffice Administrativo)
- **Função:** Interface de gestão para alta gestão.
- **Responsabilidade:** Endpoints de CRUD (Criar, Ler, Atualizar e Deletar) para que a dona manipule funcionários e métricas sem usar o painel técnico do Django.

## 🛠️ Tecnologias e Ferramentas

### Backend
- **Django 5.x & DRF:** Base para construção da API REST.
- **PostgreSQL:** Banco de dados relacional para alta integridade.
- **Token Authentication:** Sistema de segurança via chaves de acesso.
- **Corsheaders:** Gestão de permissões de origem entre Backend (8000) e Frontend (5173).

### Frontend
- **React 19 & Vite:** Biblioteca core e ferramenta de build de próxima geração.
- **Tailwind CSS 4:** Estilização moderna baseada em utilitários diretamente via CSS.
- **Lucide React:** Pacote de ícones consistentes.
- **Axios:** Cliente HTTP com interceptores globais para autenticação.

### Infraestrutura
- **Docker & Docker Compose:** Containerização completa para garantir paridade entre os ambientes de desenvolvimento.

## 🚀 Guia de Instalação e Execução

Este projeto utiliza **Docker**, portanto, não é necessário instalar Python, Node ou PostgreSQL localmente na sua máquina.

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.
- [Git](https://git-scm.com/) para clonar o repositório.

### Passo a Passo

1. **Clonar o Repositório:**
```
git clone https://github.com/seu-usuario/staff-sales-manager.git 
cd staff-sales-manager 
```

2. **Configurar Variáveis de Ambiente:** Crie um arquivo chamado .env na raiz do projeto e preencha com as configurações necessárias (use o arquivo .env.example como base).
3. **Construir e Iniciar os Containers:** O comando abaixo irá baixar as imagens, instalar as dependências do Django e do React, e subir o banco de dados:
```
docker-compose up --build

```

4. **Aplicar Migrações e Criar Superusuário:** Com os containers rodando, abra um novo terminal e execute: 

```
# Criar as tabelas no banco de dados docker-compose exec backend python manage.py migrate # Criar acesso administrativo docker-compose exec backend python manage.py createsuperuser 
```

5. **Acessar a Aplicação:**
Frontend:[ http://localhost:5173](https://www.google.com/search?q=http://localhost:5173&authuser=1)
Backend (API):[ http://localhost:8000/api](https://www.google.com/search?q=http://localhost:8000/api&authuser=1)
Admin Django:[ http://localhost:8000/admin](https://www.google.com/search?q=http://localhost:8000/admin&authuser=1)



