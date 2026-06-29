import random
import datetime
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db.models import Sum
from django.utils import timezone

from core.models import Loja, Equipe, Metrica, Relatorio
from users.models import CustomUser

# ================== CONFIGURACOES ==================
# Ajuste os números conforme a quantidade de dados que deseja gerar

NUM_LOJAS = 4
NUM_EQUIPES_POR_LOJA = 3
NUM_VENDEDORES_POR_EQUIPE = 5
NUM_RELATORIOS_POR_VENDEDOR = 30    # aproximadamente, por vendedor
DIAS_PARA_TRAS = 90                 # gerar dados dos últimos 90 dias
TAXA_CONVERSAO = 0.45              # ~45% dos atendimentos fecham venda

# ====================================================

BR_STORES = [
    ("Joias Paulista", "São Paulo"),
    ("Joias Copacabana", "Rio de Janeiro"),
    ("Joias Savassi", "Belo Horizonte"),
    ("Joias Batel", "Curitiba"),
]

BR_CIDADES_EXTRA = [
    ("Joias Iguatemi", "Salvador"),
    ("Joias Beira-Mar", "Florianópolis"),
    ("Joias Moinhos", "Porto Alegre"),
    ("Joias Boa Viagem", "Recife"),
]

BR_FIRST_NAMES_MALE = [
    "Lucas", "Gabriel", "Rafael", "Matheus", "Felipe",
    "Bruno", "Thiago", "André", "Marcos", "Leonardo",
    "Gustavo", "Pedro", "Vitor", "Rodrigo", "Diego",
    "Renato", "Júlio", "Carlos", "Eduardo", "Sérgio",
]

BR_FIRST_NAMES_FEMALE = [
    "Ana", "Juliana", "Mariana", "Camila", "Fernanda",
    "Patrícia", "Amanda", "Larissa", "Beatriz", "Caroline",
    "Bruna", "Natália", "Letícia", "Gabriela", "Priscila",
    "Renata", "Vanessa", "Bianca", "Tatiane", "Aline",
]

BR_LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Lima",
    "Costa", "Pereira", "Carvalho", "Almeida", "Ferreira",
    "Ribeiro", "Araújo", "Rodrigues", "Gomes", "Martins",
    "Barbosa", "Dias", "Moreira", "Teixeira", "Nunes",
]

METRICAS_PADRAO = [
    ("Preço", "Cliente achou o preço muito alto"),
    ("Não atende", "Cliente não foi atendido / desistiu de esperar"),
    ("Produto indisponível", "O produto desejado não estava em estoque"),
    ("Somente pesquisando", "Cliente estava apenas olhando, sem intenção de compra"),
    ("Forma de pagamento", "Cliente não concordou com as condições de pagamento"),
    ("Atendimento", "Cliente insatisfeito com o atendimento"),
    ("Prazo de entrega", "Prazo de entrega muito longo para o cliente"),
    ("Concorrência", "Cliente encontrou melhor oferta na concorrência"),
    ("Orçamento", "Cliente levou orçamento mas não retornou"),
    ("Desistência", "Cliente desistiu da compra sem motivo específico"),
]

NOMES_CLIENTES = [
    "João", "Maria", "José", "Antônio", "Francisco",
    "Francisca", "Raimunda", "Sebastião", "Paulo", "Adriana",
    "Roberto", "Cláudia", "Daniel", "Cristina", "Marcelo",
    "Luciana", "Ricardo", "Sandra", "Alexandre", "Mônica",
    "Walter", "Elaine", "César", "Helena", "Jorge",
    "Marta", "Fábio", "Regina", "Sandro", "Vera",
]


class Command(BaseCommand):
    help = 'Popula o banco com dados de demonstracao para apresentacoes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('=== INICIANDO SEED (modo: preservar dados existentes) ==='))
        self.stdout.write('')

        self._criar_admin()
        lojas = self._criar_lojas()
        equipas = self._criar_equipes(lojas)
        metricas = self._criar_metricas(lojas)
        vendedores = self._criar_vendedores_supervisores(lojas, equipas)
        self._criar_relatorios(vendedores, metricas)

        self.stdout.write(self.style.SUCCESS('\n=== SEED CONCLUIDO COM SUCESSO ==='))
        self._exibir_resumo(lojas, equipas, metricas, vendedores)

    # ---------- criacao ----------

    def _criar_admin(self):
        if not CustomUser.objects.filter(cargo='ADMIN').exists():
            CustomUser.objects.create_user(
                username='admin',
                email='admin@joias.com.br',
                password='admin123',
                first_name='Administrador',
                last_name='Sistema',
                cargo='ADMIN',
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write('  Admin criado: admin@joias.com.br / admin123')
        else:
            self.stdout.write('  Admin já existe, pulando.')

    def _criar_lojas(self):
        lojas = list(Loja.objects.all())
        existentes = len(lojas)

        if existentes >= NUM_LOJAS:
            self.stdout.write(f'  {existentes} lojas existentes (meta: {NUM_LOJAS}), pulando criação.')
            return lojas

        loja_dados = BR_STORES[:]
        random.shuffle(loja_dados)
        nomes_existentes = set(l.nome for l in lojas)

        for nome, cidade in loja_dados:
            if len(lojas) >= NUM_LOJAS:
                break
            if nome in nomes_existentes:
                continue
            loja = Loja.objects.create(nome=nome, cidade=cidade)
            lojas.append(loja)
            self.stdout.write(f'  Loja: {loja}')

        return lojas

    def _criar_equipes(self, lojas):
        equipas = list(Equipe.objects.all())

        # Mapeia quantas equipes cada loja já tem
        contagem = {loja.id: 0 for loja in lojas}
        for eq in equipas:
            if eq.loja_id in contagem:
                contagem[eq.loja_id] += 1

        nomes_equipes = ['Ouro', 'Prata', 'Bronze', 'Diamante', 'Esmeralda', 'Rubi']
        equipes_existentes = set((eq.nome, eq.loja_id) for eq in equipas)

        criadas = 0
        for loja in lojas:
            faltam = NUM_EQUIPES_POR_LOJA - contagem.get(loja.id, 0)
            if faltam <= 0:
                continue
            random.shuffle(nomes_equipes)
            for i in range(NUM_EQUIPES_POR_LOJA):
                if faltam <= 0:
                    break
                nome = nomes_equipes[i]
                if (nome, loja.id) not in equipes_existentes:
                    eq = Equipe.objects.create(nome=nome, loja=loja)
                    equipas.append(eq)
                    equipes_existentes.add((nome, loja.id))
                    criadas += 1
                    faltam -= 1
                    self.stdout.write(f'    Equipe: {eq}')

        if criadas:
            self.stdout.write(f'  {criadas} equipes criadas')
        else:
            equipas_por_loja = sum(1 for eq in equipas if eq.loja_id in contagem)
            self.stdout.write(f'  {equipas_por_loja} equipes existentes, pulando.')

        return equipas

    def _criar_metricas(self, lojas):
        existentes = set(Metrica.objects.values_list('nome', flat=True))
        criadas = 0

        for nome, desc in METRICAS_PADRAO:
            if nome not in existentes:
                Metrica.objects.create(
                    nome=nome,
                    descricao=desc,
                    loja=random.choice(lojas) if random.random() > 0.3 else None,
                )
                criadas += 1

        if criadas:
            self.stdout.write(f'  {criadas} metricas criadas')
        else:
            self.stdout.write(f'  {len(existentes)} metricas existentes, pulando.')

        return list(Metrica.objects.filter(nome__in=[m[0] for m in METRICAS_PADRAO]))

    def _criar_vendedores_supervisores(self, lojas, equipas):
        equipas_por_loja = {}
        for eq in equipas:
            equipas_por_loja.setdefault(eq.loja_id, []).append(eq)

        vendedores = list(CustomUser.objects.filter(cargo='VENDEDOR'))
        usado = set(f'{u.first_name} {u.last_name}' for u in vendedores)
        for u in CustomUser.objects.filter(cargo='SUPERVISOR'):
            usado.add(f'{u.first_name} {u.last_name}')

        criados_sup = 0
        criados_vend = 0

        for loja in lojas:
            equipas_da_loja = equipas_por_loja.get(loja.id, [])
            if not equipas_da_loja:
                continue

            # Supervisor
            sup_existe = CustomUser.objects.filter(cargo='SUPERVISOR', loja=loja).exists()
            if not sup_existe:
                nome = self._nome_unico(usado)
                sup = CustomUser.objects.create_user(
                    username=f'supervisor.{loja.id}',
                    email=f'supervisor.loja{loja.id}@joias.com.br',
                    password='venda123',
                    first_name=nome.split()[0],
                    last_name=nome.split()[1],
                    cargo='SUPERVISOR',
                    loja=loja,
                    is_staff=True,
                )
                criados_sup += 1
                self.stdout.write(f'  Supervisor: {sup.username} ({sup.first_name} {sup.last_name})')

            # Vendedores por equipe
            for eq in equipas_da_loja:
                existentes = CustomUser.objects.filter(
                    cargo='VENDEDOR', loja=loja, equipe=eq
                ).count()
                faltam = NUM_VENDEDORES_POR_EQUIPE - existentes

                for _ in range(faltam):
                    nome = self._nome_unico(usado)
                    pin = f'{random.randint(1000, 9999)}'
                    index = len(vendedores) + criados_vend
                    vend = CustomUser.objects.create_user(
                        username=f'vendedor.{loja.id}.{eq.id}.{index}',
                        email=f'vendedor.l{loja.id}.e{eq.id}.{index}@joias.com.br',
                        password='venda123',
                        first_name=nome.split()[0],
                        last_name=nome.split()[1],
                        cargo='VENDEDOR',
                        loja=loja,
                        equipe=eq,
                        pin=pin,
                    )
                    vendedores.append(vend)
                    criados_vend += 1

        vendedores = list(CustomUser.objects.filter(cargo='VENDEDOR'))
        if criados_sup:
            self.stdout.write(f'  {criados_sup} supervisores criados')
        if criados_vend:
            self.stdout.write(f'  {criados_vend} vendedores criados')
        else:
            sup_count = CustomUser.objects.filter(cargo='SUPERVISOR').count()
            self.stdout.write(f'  {sup_count} supervisores e {len(vendedores)} vendedores já existentes, pulando.')

        return vendedores

    def _criar_relatorios(self, vendedores, metricas):
        hoje = timezone.now()
        total = 0
        vendas = 0

        for vendedor in vendedores:
            num_relatorios = random.randint(
                NUM_RELATORIOS_POR_VENDEDOR - 15,
                NUM_RELATORIOS_POR_VENDEDOR + 15,
            )
            for _ in range(max(1, num_relatorios)):
                dias_atras = random.randint(0, DIAS_PARA_TRAS)
                segundos_offset = random.randint(0, 86400 - 1)
                data_hora = hoje - datetime.timedelta(days=dias_atras, seconds=segundos_offset)

                venda_fechada = random.random() < TAXA_CONVERSAO

                relatorio = Relatorio(
                    data_hora=data_hora,
                    venda_fechada=venda_fechada,
                    vendedor=vendedor,
                )

                if venda_fechada:
                    relatorio.valor_venda = Decimal(str(round(random.uniform(150, 15000), 2)))
                    relatorio.cliente_nome = random.choice(NOMES_CLIENTES) if random.random() > 0.4 else ''
                    relatorio.observacoes = self._obs_venda() if random.random() > 0.6 else ''
                    vendas += 1
                else:
                    relatorio.metrica = random.choice(metricas)
                    relatorio.cliente_nome = random.choice(NOMES_CLIENTES) if random.random() > 0.3 else ''
                    relatorio.observacoes = self._obs_nao_venda() if random.random() > 0.5 else ''

                relatorio.save()
                total += 1

        self.stdout.write(f'  {total} relatorios criados ({vendas} vendas, {total - vendas} nao fechadas)')

    # ---------- helpers ----------

    def _nome_unico(self, usado):
        while True:
            nomes = BR_FIRST_NAMES_FEMALE if random.random() > 0.5 else BR_FIRST_NAMES_MALE
            primeiro = random.choice(nomes)
            sobrenome = random.choice(BR_LAST_NAMES)
            completo = f'{primeiro} {sobrenome}'
            if completo not in usado:
                usado.add(completo)
                return completo

    def _obs_venda(self):
        opcoes = [
            'Cliente muito satisfeito com o produto.',
            'Comprou anel de ouro 18k.',
            'Pagamento parcelado em 10x.',
            'Cliente indicado por outro cliente.',
            'Venda realizada com desconto gerencial.',
            'Cliente comprou também uma corrente.',
            'Garantia estendida contratada.',
            'Cliente voltou para fechar a compra.',
        ]
        return random.choice(opcoes)

    def _obs_nao_venda(self):
        opcoes = [
            'Achou o preço acima do orçamento.',
            'Vai pensar e retornar depois.',
            'Queria um modelo que não temos em estoque.',
            'Estava acompanhando a esposa, não comprou.',
            'Pediu para reservar e não voltou.',
            'Cliente precisava do produto para o mesmo dia.',
            'Não gostou das opções disponíveis.',
            'Queria apenas fazer um orçamento.',
        ]
        return random.choice(opcoes)

    # ---------- resumo ----------

    def _exibir_resumo(self, lojas, equipas, metricas, vendedores):
        total_relatorios = Relatorio.objects.count()
        total_vendas = Relatorio.objects.filter(venda_fechada=True).count()
        valor_total = (
            Relatorio.objects
            .filter(venda_fechada=True)
            .aggregate(total=Sum('valor_venda'))['total']
        ) or 0

        self.stdout.write(f'\nLojas:          {len(lojas)}')
        self.stdout.write(f'Equipes:        {len(equipas)}')
        self.stdout.write(f'Métricas:       {len(metricas)}')
        self.stdout.write(f'Vendedores:     {len(vendedores)}')
        self.stdout.write(f'Relatórios:     {total_relatorios}')
        self.stdout.write(f'  Vendas:       {total_vendas}')
        self.stdout.write(f'  Não vendas:   {total_relatorios - total_vendas}')
        self.stdout.write(f'Valor total:    R$ {valor_total:,.2f}')

        self.stdout.write(f'\nLogin Admin:')
        self.stdout.write(f'  Email:    admin@joias.com.br')
        self.stdout.write(f'  Senha:    admin123')
        self.stdout.write(f'\nLogin Vendedor (exemplo):')
        self.stdout.write(f'  Email:    vendedor.l1.e1.0@joias.com.br')
        self.stdout.write(f'  Senha:    venda123')
