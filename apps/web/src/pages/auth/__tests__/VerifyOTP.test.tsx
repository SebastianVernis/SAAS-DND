import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VerifyOTP from '../VerifyOTP';
import { MemoryRouter } from 'react-router-dom';

describe('VerifyOTP', () => {
  it('renders the OTP form', () => {
    render(
      <MemoryRouter>
        <VerifyOTP />
      </MemoryRouter>
    );

    // Check for the OTP input fields
    const otpInputs = screen.getAllByRole('textbox');
    expect(otpInputs).toHaveLength(6);

    // Check for the submit button
    expect(screen.getByRole('button', { name: 'Verificar Código' })).toBeInTheDocument();
  });
});
