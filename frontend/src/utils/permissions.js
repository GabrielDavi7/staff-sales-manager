// frontend/src/utils/permissions.js
export const getNavLinks = (cargo) => {
  const allLinks = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['VENDEDOR', 'SUPERVISOR', 'ADMIN'],
    },
    {
      label: 'Registrar Atendimento',
      path: '/dashboard/registrar',
      roles: ['VENDEDOR'],
    },
    {
      label: 'Meu Desempenho',
      path: '/dashboard/meu-desempenho',
      roles: ['VENDEDOR'],
    },
    {
      label: 'Administração',
      path: '/dashboard/admin',
      roles: ['ADMIN'],
    },
  ];

  return allLinks.filter(link => link.roles.includes(cargo));
};