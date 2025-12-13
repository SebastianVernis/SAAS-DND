import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Login from '../Login';
import { MemoryRouter } from 'react-router-dom';

describe('Login', () => {
  it('renders the login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });
});
