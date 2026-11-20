import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Amount from '../Amount';
import { useSettings } from '../../contexts/SettingsContext';

// Mock the context hook
vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

describe('Amount Component', () => {
  it('renders blurred value when privacyMode is enabled', () => {
    useSettings.mockReturnValue({
      privacyMode: true,
      currency: '€',
      language: 'el',
    });

    render(<Amount value={123.45} />);
    const el = screen.getByText(/123/);
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('blur-[6px]');
    expect(el).toHaveAttribute('data-privacy', 'blurred');
  });

  it('renders formatted value when privacyMode is disabled', () => {
    useSettings.mockReturnValue({
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<Amount value={123.45} />);
    // Note: Depends on locale formatting, but basically should show the number
    expect(screen.getByText(/123\.45/)).toBeInTheDocument();
    expect(screen.getByText(/€/)).toBeInTheDocument();
  });

  it('respects the prefix prop', () => {
    useSettings.mockReturnValue({
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<Amount value={100} prefix="Total: " />);
    expect(screen.getByText(/Total: 100\.00/)).toBeInTheDocument();
  });

  it('masks with prefix and blurs when privacyMode is enabled', () => {
    useSettings.mockReturnValue({
      privacyMode: true,
      currency: '€',
      language: 'en',
    });

    render(<Amount value={100} prefix="Total: " />);
    const el = screen.getByText(/Total: 100\.00/);
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('blur-[6px]');
    expect(el).toHaveAttribute('data-privacy', 'blurred');
  });

  it('formats with Greek locale correctly', () => {
    useSettings.mockReturnValue({
      privacyMode: false,
      currency: '€',
      language: 'el',
    });

    render(<Amount value={1234.56} />);
    // Greek uses comma for decimal and dot for thousands
    // Use a more flexible regex that doesn't care about the specific thousand separator character
    const text = screen.getByText(/1.*234,56/);
    expect(text).toBeInTheDocument();
    expect(screen.getByText(/€/)).toBeInTheDocument();
  });
});









