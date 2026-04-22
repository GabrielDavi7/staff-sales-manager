# 1. Imagem base: Usando a versão estável mais recente do Python (3.12-slim para ser leve)
FROM python:3.12-slim

# 2. Configurações de ambiente para o Python não gerar arquivos .pyc e não bufferizar logs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Definir diretório de trabalho dentro do container
WORKDIR /app

# 4. Instalar dependências do sistema necessárias para o PostgreSQL e compilação
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 5. Instalar dependências do Python
# Copiamos primeiro apenas o requirements para aproveitar o cache do Docker
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# 6. Copiar o restante do código do projeto para o container
COPY . /app/

# 7. Expor a porta padrão do Django
EXPOSE 8000

# 8. Comando para rodar a aplicação (ajustaremos conforme o docker-compose depois)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]