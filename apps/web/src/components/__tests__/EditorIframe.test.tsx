import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EditorIframe from '../EditorIframe';

describe('EditorIframe', () => {
  it('renders the iframe and controls', () => {
    render(<EditorIframe src="about:blank" />);

    // Check for the iframe title
    expect(screen.getByTitle('Editor')).toBeInTheDocument();

    // Check for some of the controls
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Tablet')).toBeInTheDocument();
    expect(screen.getByText('Mobile')).toBeInTheDocument();

    // Check for the color input by its label's text
    expect(screen.getByText('Color Principal')).toBeInTheDocument();
  });
});
