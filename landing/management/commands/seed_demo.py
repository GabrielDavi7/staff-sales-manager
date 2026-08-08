"""
Management command to seed the database with realistic demo data for
screenshots and landing page presentation.

Usage:
    python manage.py seed_demo

Creates:
    - 2 stores (Lojas) with teams
    - 8 metrics (non-conversion reasons)
    - Users: 1 admin, 1 supervisor, 8 salespeople, 1 dispositivo
    - ~70 realistic attendance records (Relatorio) over the last 30 days
"""

import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Loja, Equipe, Metrica, Relatorio
from users.models import CustomUser


class Command(BaseCommand):
    help = "Popula o banco de dados com dados de demonstração realistas para a landing page."

    def handle(self, *args, **options):
        self.stdout.write("🌱 Iniciando seed de demonstração...")

        # ── Limpar dados existentes ──────────────────────────────────
        self.stdout.write("  Limpando dados existentes...")
        Relatorio.objects.all().delete()
        CustomUser.objects.all().delete()
        Metrica.objects.all().delete()
        Equipe.objects.all().delete()
        Loja.objects.all().delete()

        # ── Lojas ────────────────────────────────────────────────────
        self.stdout.write("  Criando lojas...")
        loja_poa = Loja.objects.create(
            nome="Joalheria Porto",
            cidade="Porto Alegre",
            ativo=True,
        )
        loja_sp = Loja.objects.create(
            nome="Joalheria São Paulo",
            cidade="São Paulo",
            ativo=True,
        )

        # ── Equipes ──────────────────────────────────────────────────
        self.stdout.write("  Criando equipes...")
        equipe_ouro = Equipe.objects.create(
            nome="Equipe Ouro",
            loja=loja_poa,
            ativo=True,
        )
        equipe_prata = Equipe.objects.create(
            nome="Equipe Prata",
            loja=loja_poa,
            ativo=True,
        )
        equipe_diamante = Equipe.objects.create(
            nome="Equipe Diamante",
            loja=loja_sp,
            ativo=True,
        )
        equipe_rubi = Equipe.objects.create(
            nome="Equipe Rubi",
            loja=loja_sp,
            ativo=True,
        )

        # ── Métricas (motivos de não conversão) ─────────────────────
        self.stdout.write("  Criando métricas...")
        metricas_data = [
            {"nome": "Preço acima do esperado", "descricao": "Cliente achou o valor do produto muito alto para o orçamento."},
            {"nome": "Não tinha o tamanho", "descricao": "Produto não disponível no tamanho ou numeração desejada."},
            {"nome": "Indecisão do cliente", "descricao": "Cliente não conseguiu decidir entre as opções disponíveis."},
            {"nome": "Frete muito caro", "descricao": "Cliente desistiu por causa do valor do frete."},
            {"nome": "Não tinha o modelo desejado", "descricao": "O modelo específico que o cliente queria não estava em estoque."},
            {"nome": "Cliente só pesquisando", "descricao": "Cliente estava apenas fazendo pesquisa de preços."},
            {"nome": "Produto não atendeu expectativa", "descricao": "Cliente esperava algo diferente do produto apresentado."},
            {"nome": "Prazo de entrega longo", "descricao": "Cliente precisava do produto em um prazo menor."},
        ]
        metricas = {}
        for m in metricas_data:
            metricas[m["nome"]] = Metrica.objects.create(
                nome=m["nome"],
                descricao=m["descricao"],
                ativo=True,
            )

        # ── Usuários ─────────────────────────────────────────────────
        self.stdout.write("  Criando usuários...")
        DEFAULT_PASSWORD = "demo1234"

        admin = CustomUser.objects.create_user(
            username="admin",
            email="admin@joiasmanager.com.br",
            password=DEFAULT_PASSWORD,
            first_name="Carlos",
            last_name="Andrade",
            cargo="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        supervisor = CustomUser.objects.create_user(
            username="supervisor.porto",
            email="supervisor@joiasmanager.com.br",
            password=DEFAULT_PASSWORD,
            first_name="Marina",
            last_name="Oliveira",
            cargo="SUPERVISOR",
            loja=loja_poa,
        )

        # Vendedores — Porto Alegre
        vendedores_poa_data = [
            {"username": "vendedor01", "email": "ana.silva@joiasmanager.com.br", "first_name": "Ana", "last_name": "Silva", "equipe": equipe_ouro, "pin": "1234"},
            {"username": "vendedor02", "email": "bruno.costa@joiasmanager.com.br", "first_name": "Bruno", "last_name": "Costa", "equipe": equipe_ouro, "pin": "2345"},
            {"username": "vendedor03", "email": "carla.souza@joiasmanager.com.br", "first_name": "Carla", "last_name": "Souza", "equipe": equipe_prata, "pin": "3456"},
            {"username": "vendedor04", "email": "diego.lima@joiasmanager.com.br", "first_name": "Diego", "last_name": "Lima", "equipe": equipe_prata, "pin": "4567"},
        ]

        # Vendedores — São Paulo
        vendedores_sp_data = [
            {"username": "vendedor05", "email": "elaine.santos@joiasmanager.com.br", "first_name": "Elaine", "last_name": "Santos", "equipe": equipe_diamante, "pin": "5678"},
            {"username": "vendedor06", "email": "felipe.dias@joiasmanager.com.br", "first_name": "Felipe", "last_name": "Dias", "equipe": equipe_diamante, "pin": "6789"},
            {"username": "vendedor07", "email": "gabriela.rocha@joiasmanager.com.br", "first_name": "Gabriela", "last_name": "Rocha", "equipe": equipe_rubi, "pin": "7890"},
            {"username": "vendedor08", "email": "henrique.melo@joiasmanager.com.br", "first_name": "Henrique", "last_name": "Melo", "equipe": equipe_rubi, "pin": "8901"},
        ]

        vendedores = []
        for v in vendedores_poa_data + vendedores_sp_data:
            vendedor = CustomUser.objects.create_user(
                username=v["username"],
                email=v["email"],
                password=DEFAULT_PASSWORD,
                first_name=v["first_name"],
                last_name=v["last_name"],
                cargo="VENDEDOR",
                loja=loja_poa if v["username"] in [x["username"] for x in vendedores_poa_data] else loja_sp,
                equipe=v["equipe"],
                pin=v["pin"],
            )
            vendedores.append(vendedor)

        dispositivo = CustomUser.objects.create_user(
            username="dispositivo.porto",
            email="dispositivo@joiasmanager.com.br",
            password=DEFAULT_PASSWORD,
            first_name="Tablet",
            last_name="Loja Porto",
            cargo="DISPOSITIVO",
            loja=loja_poa,
        )

        # ── Atendimentos ─────────────────────────────────────────────
        self.stdout.write("  Criando atendimentos (isto pode demorar um pouco)...")

        # Nomes de clientes realistas brasileiros
        clientes = [
            "Maria Fernanda", "João Pedro", "Patrícia Almeida", "Roberto Nunes",
            "Luciana Vargas", "Ricardo Teixeira", "Amanda Borges", "Paulo César",
            "Fernanda Montenegro", "Eduardo Campos", "Tatiane Ribeiro", "Marcos Vinícius",
            "Juliana Martins", "Sérgio Moraes", "Camila Duarte", "Rafael Pires",
            "Beatriz Azevedo", "Gustavo Henrique", "Larissa Peixoto", "Antônio Carlos",
            "Natália Freitas", "Thiago Neves", "Isabela Cardoso", "André Felipe",
            "Renata Barros", "Leonardo Moura", "Vanessa Cunha", "Fábio Júnior",
            "Cristina Farias", "Alexandre Reis",
        ]

        # Produtos de joalheria para observações de vendas fechadas
        produtos = [
            "Aliança ouro 18k", "Anel solitário diamante", "Colar pérolas",
            "Brinco esmeralda", "Pulseira ouro branco", "Relógio importado",
            "Gargantilha prata", "Anel formatura", "Colar ouro rosé",
            "Brinco rubi", "Pulseira diamantes", "Aliança namoro ouro",
            "Colar cruz ouro", "Anel noivado", "Brinco pérola",
            "Pulseira berloques", "Colar ouro amarelo", "Anel safira",
            "Brinco ouro 18k", "Colar coração prata",
        ]

        hoje = timezone.now()
        vendedores_ativos = vendedores

        # Gerar entre 65 e 80 atendimentos
        total_atendimentos = random.randint(65, 80)
        atendimentos_criados = 0

        for _ in range(total_atendimentos):
            vendedor = random.choice(vendedores_ativos)
            dias_atras = random.randint(0, 30)
            horas = random.randint(8, 19)
            minutos = random.randint(0, 59)
            data_atendimento = hoje - timedelta(days=dias_atras, hours=hoje.hour - horas, minutes=hoje.minute - minutos)
            # Ajustar para não ficar no futuro
            if data_atendimento > hoje:
                data_atendimento = hoje - timedelta(days=dias_atras)

            # ~35% de chance de venda fechada
            venda_fechada = random.random() < 0.35

            if venda_fechada:
                valor = Decimal(str(round(random.uniform(150.00, 8500.00), 2)))
                cliente = random.choice(clientes)
                produto = random.choice(produtos)
                observacao = f"Cliente: {cliente} — {produto} — Comprou"
                Relatorio.objects.create(
                    data_hora=data_atendimento,
                    venda_fechada=True,
                    valor_venda=valor,
                    vendedor=vendedor,
                    cliente_nome=cliente,
                    observacoes=observacao,
                )
            else:
                metrica = random.choice(list(metricas.values()))
                cliente = random.choice(clientes)
                observacao = f"Cliente: {cliente} — {metrica.nome}"
                # Às vezes adiciona mais detalhes
                if random.random() < 0.4:
                    extras = [
                        " — Cliente voltará na próxima semana",
                        " — Indicou que comprará online",
                        " — Queria presente de aniversário",
                        " — Achou o design antiquado",
                        " — Vai consultar o cônjuge antes",
                    ]
                    observacao += random.choice(extras)
                Relatorio.objects.create(
                    data_hora=data_atendimento,
                    venda_fechada=False,
                    metrica=metrica,
                    vendedor=vendedor,
                    cliente_nome=cliente,
                    observacoes=observacao,
                )
            atendimentos_criados += 1

        # ── Resumo ────────────────────────────────────────────────────
        total_vendas = Relatorio.objects.filter(venda_fechada=True).count()
        total_nao_vendas = Relatorio.objects.filter(venda_fechada=False).count()

        self.stdout.write(self.style.SUCCESS(
            f"\n✅ Seed concluído com sucesso!\n"
            f"   📍 Lojas:        {Loja.objects.count()}\n"
            f"   👥 Equipes:      {Equipe.objects.count()}\n"
            f"   📊 Métricas:     {Metrica.objects.count()}\n"
            f"   👤 Usuários:     {CustomUser.objects.count()}\n"
            f"   📝 Atendimentos: {atendimentos_criados} "
            f"({total_vendas} vendas, {total_nao_vendas} não convertidas)\n"
            f"\n   🔑 Senha padrão para todos os usuários: {DEFAULT_PASSWORD}"
        ))
