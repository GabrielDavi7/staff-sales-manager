💎 Staff Sales Manager - Joias Centro
Sistema fullstack de gerenciamento de vendas e performance para joalherias, desenvolvido com foco em escalabilidade, modularização e containerização.

🏛️ Arquitetura do Backend (Django)
O backend foi estruturado seguindo o princípio da Responsabilidade Única, permitindo que o sistema cresça sem criar dependências confusas entre os diferentes setores da empresa.

Divisão por Aplicações (Apps)
users (Identidade e Acesso): Central de usuários do ecossistema. Permite a existência de usuários "Transversais" (como Supervisores e Administradores) que possuem credenciais, mas não estão obrigatoriamente vinculados a uma única loja física.

core (Estrutura de Negócio): Mapeamento físico e lógico. Contém as entidades base: Loja, Equipe e Metrica. É a "Single Source of Truth" para a estrutura da empresa.

analytics (Operação e Performance): Motor de processamento de dados. Responsável por registrar cada interação de venda (Relatorios) e vincular vendedores às métricas de desempenho.

management (Backoffice Administrativo): Fornece os endpoints de CRUD para que a gestão manipule funcionários, lojas e métricas via interface customizada, sem depender do admin padrão do Django.

🛠️ Tecnologias e Ferramentas
Backend
Django 5.x & DRF: Base para construção da API REST.

PostgreSQL: Banco de dados relacional para alta integridade.

Token Authentication: Sistema de segurança via chaves de acesso.

Corsheaders: Gestão de permissões de origem entre Backend (8000) e Frontend (5173).

Frontend
React 19 & Vite: Biblioteca core e ferramenta de build de próxima geração.

Tailwind CSS 4: Estilização moderna baseada em utilitários diretamente via CSS.

Lucide React: Pacote de ícones consistentes.

Axios: Cliente HTTP com interceptores globais para autenticação.

Infraestrutura
Docker & Docker Compose: Containerização completa para garantir paridade entre os ambientes de desenvolvimento.

🚀 Guia de Instalação e Execução
Como o projeto utiliza Docker, não é necessário instalar Python, Node ou PostgreSQL localmente.

Pré-requisitos

   Docker Desktop instalado e rodando.
   Git para clonar o repositório.

Passo a Passo:

1. Clonar o Repositório:
```
git clone https://github.com/seu-usuario/staff-sales-manager.git 
cd staff-sales-manager 
```

2. Configurar Variáveis de Ambiente: Crie um arquivo chamado .env na raiz do projeto e preencha com as configurações necessárias (use o arquivo .env.example como base).

3. Construir e Iniciar os Containers: O comando abaixo irá baixar as imagens, instalar as dependências do Django e do React, e subir o banco de dados:
```
docker-compose up --build

```

4. Aplicar Migrações e Criar Superusuário: Com os containers rodando, abra um novo terminal e execute: 

```
# Criar as tabelas no banco de dados docker-compose exec backend python manage.py migrate # Criar acesso administrativo docker-compose exec backend python manage.py createsuperuser 
```

5. Acessar a Aplicação:
   Frontend: http://localhost:5173
   Backend (API): http://localhost:8000/api
   Admin Django: http://localhost:8000/admin

🏗️ Fluxo de Desenvolvimento
Para garantir a modularidade, as importações devem seguir a hierarquia estabelecida:

Modelos de negócio (Loja, Metrica) devem ser importados sempre de core.models.

A autenticação no frontend é gerida centralmente pelo AuthContext utilizando PrivateRoutes.

Dica para o GitHub:
Se quiser deixar o README ainda mais impactante, você pode tirar um screenshot da sua nova tela de Login e Dashboard e colocar no topo do documento usando:
![Preview do Sistema](./caminho/para/imagem.png)

Ficou algum ponto de fora que você queira detalhar mais antes de finalizar?