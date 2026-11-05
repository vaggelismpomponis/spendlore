import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TermsOfServiceView from '../TermsOfServiceView';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

describe('TermsOfServiceView', () => {
  it('renders terms of service headings in Greek', () => {
    useSettings.mockReturnValue({ language: 'el' });
    const mockOnBack = vi.fn();

    render(<TermsOfServiceView onBack={mockOnBack} hideHeader={false} />);

    expect(screen.getByText('Όροι Παροχής Υπηρεσιών')).toBeInTheDocument();
    expect(screen.getByText('1. Αποδοχή των Όρων')).toBeInTheDocument();
    expect(screen.getByText('7. Εφαρμοστέο Δίκαιο & Επικοινωνία')).toBeInTheDocument();
  });

  it('does not render back button when hideBack is true', () => {
    useSettings.mockReturnValue({ language: 'el' });
    render(<TermsOfServiceView hideBack={true} hideHeader={true} />);

    expect(screen.queryByText('Επιστροφή')).not.toBeInTheDocument();
  });

  it('renders back breadcrumb when hideHeader is true and onBack is provided', () => {
    useSettings.mockReturnValue({ language: 'el' });
    const mockOnBack = vi.fn();
    render(<TermsOfServiceView onBack={mockOnBack} hideHeader={true} />);

    const backBtn = screen.getByText('Επιστροφή');
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});

