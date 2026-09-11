import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RedirectToSlug } from '../routes.jsx';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { cargo: 'ADMIN_CLIENTE', cliente_slug: 'empresa-a' }, loading: false }),
}));

function Location() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

describe('Navegação da empresa', () => {
  it.each([
    ['/adminpainel', '/empresa-a/adminpainel'],
    ['/graficos?periodo=30', '/empresa-a/graficos?periodo=30'],
    ['/empresa-b/adminpainel', '/empresa-a/adminpainel'],
    ['/empresa-a/adminpainel', '/empresa-a/adminpainel'],
  ])('preserva a página ao normalizar %s', async (source, target) => {
    render(<MemoryRouter initialEntries={[source]}><Routes>
      <Route path="/adminpainel" element={<RedirectToSlug><Location /></RedirectToSlug>} />
      <Route path="/graficos" element={<RedirectToSlug><Location /></RedirectToSlug>} />
      <Route path="/:slug/*" element={<RedirectToSlug><Location /></RedirectToSlug>} />
    </Routes></MemoryRouter>);
    expect(await screen.findByTestId('location')).toHaveTextContent(target);
  });
});
