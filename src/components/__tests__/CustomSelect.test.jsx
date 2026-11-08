import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomSelect from '../CustomSelect';

describe('CustomSelect Component', () => {
    const mockOptions = [
        { value: 'home', label: 'Σπίτι' },
        { value: 'shopping', label: 'Αγορές' },
        { value: 'food', label: 'Φαγητό' },
    ];

    it('renders placeholder when no value is selected', () => {
        render(<CustomSelect placeholder="— Επίλεξε κατηγορία —" options={mockOptions} value="" onChange={vi.fn()} />);
        expect(screen.getByText('— Επίλεξε κατηγορία —')).toBeInTheDocument();
    });

    it('renders selected option label', () => {
        render(<CustomSelect options={mockOptions} value="home" onChange={vi.fn()} />);
        expect(screen.getByText('Σπίτι')).toBeInTheDocument();
    });

    it('opens dropdown on click and displays options', () => {
        render(<CustomSelect options={mockOptions} value="home" onChange={vi.fn()} />);
        const trigger = screen.getByRole('button');
        fireEvent.click(trigger);

        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('Αγορές')).toBeInTheDocument();
        expect(screen.getByText('Φαγητό')).toBeInTheDocument();
    });

    it('calls onChange with selected value and closes dropdown', () => {
        const handleChange = vi.fn();
        render(<CustomSelect options={mockOptions} value="home" onChange={handleChange} />);

        fireEvent.click(screen.getByRole('button'));
        const option = screen.getByText('Αγορές');
        fireEvent.click(option);

        expect(handleChange).toHaveBeenCalledWith('shopping');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes on Escape key press', () => {
        render(<CustomSelect options={mockOptions} value="home" onChange={vi.fn()} />);
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes on click outside', () => {
        render(
            <div>
                <span data-testid="outside">Outside</span>
                <CustomSelect options={mockOptions} value="home" onChange={vi.fn()} />
            </div>
        );
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();

        fireEvent.pointerDown(screen.getByTestId('outside'));
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not open when disabled', () => {
        render(<CustomSelect options={mockOptions} value="home" onChange={vi.fn()} disabled={true} />);
        fireEvent.click(screen.getByRole('button'));
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('filters options with search input when searchable is true', () => {
        const manyOptions = [
            'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'
        ];
        render(<CustomSelect options={manyOptions} value="Apple" searchable={true} onChange={vi.fn()} />);
        fireEvent.click(screen.getByRole('button'));

        const searchInput = screen.getByPlaceholderText('Αναζήτηση...');
        fireEvent.change(searchInput, { target: { value: 'Gra' } });

        expect(screen.getByText('Grape')).toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });
});

