// frontend/src/pages/dashboard/Home.jsx
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
      <h2 style={{ color: 'var(--color-dark)', fontWeight: 600 }}>Bem-vindo ao Dashboard</h2>
      
      <Card title="🎨 Botões (variantes e tamanhos)">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="danger">Perigo</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="primary" size="small">Pequeno</Button>
          <Button variant="primary" size="large">Grande</Button>
          <Button variant="primary" disabled>Desabilitado</Button>
        </div>
      </Card>

      <Card title="📝 Inputs">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Input label="Nome completo" placeholder="Digite seu nome" />
          <Input label="E-mail" type="email" placeholder="email@exemplo.com" />
          <Input label="Campo com erro" error="Este campo é obrigatório" />
          <Input label="Senha" type="password" placeholder="••••••••" />
        </div>
      </Card>

      <Card title="📦 Cards aninhados">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Card title="Métrica 1">
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>24</span>
            <p>Atendimentos hoje</p>
          </Card>
          <Card title="Métrica 2">
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>R$ 12.450</span>
            <p>Vendas do mês</p>
          </Card>
          <Card>
            <p>Card sem título, usando apenas corpo.</p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default Home;