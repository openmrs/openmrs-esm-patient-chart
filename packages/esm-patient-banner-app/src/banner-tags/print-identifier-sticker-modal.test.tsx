import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useReactToPrint } from 'react-to-print';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockPatient } from 'tools';
import PrintIdentifierSticker from './print-identifier-sticker.modal';

const mockCloseModal = jest.fn();
const mockUseReactToPrint = jest.mocked(useReactToPrint);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('react-to-print', () => {
  const originalModule = jest.requireActual('react-to-print');

  return {
    ...originalModule,
    useReactToPrint: jest.fn(),
  };
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  printIdentifierStickerFields: ['name', 'identifier', 'age', 'dateOfBirth', 'gender'],
});

describe('PrintIdentifierSticker', () => {
  test('renders the component', () => {
    render(<PrintIdentifierSticker patient={mockPatient} closeModal={mockCloseModal} />);

    expect(screen.getByText(/Print Identifier Sticker/i)).toBeInTheDocument();
    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText('100GEJ')).toBeInTheDocument();
    expect(screen.getByText('1972-04-04')).toBeInTheDocument();
  });

  test('calls closeModal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<PrintIdentifierSticker patient={mockPatient} closeModal={mockCloseModal} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeInTheDocument();

    await user.click(cancelButton);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  test('calls the print function when print button is clicked', async () => {
    const handlePrint = jest.fn();
    mockUseReactToPrint.mockReturnValue(handlePrint);

    const user = userEvent.setup();

    render(<PrintIdentifierSticker patient={mockPatient} closeModal={mockCloseModal} />);

    const printButton = screen.getByRole('button', { name: /Print/i });
    expect(printButton).toBeInTheDocument();

    await user.click(printButton);
    expect(handlePrint).toHaveBeenCalled();
  });
});
