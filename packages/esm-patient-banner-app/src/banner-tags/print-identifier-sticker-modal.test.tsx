import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useReactToPrint } from 'react-to-print';
import { mockPatient } from 'tools';
import PrintIdentifierSticker from './print-identifier-sticker.modal';

const mockedCloseModal = jest.fn();
const mockedUseReactToPrint = jest.mocked(useReactToPrint);

jest.mock('react-to-print', () => {
  const originalModule = jest.requireActual('react-to-print');

  return {
    ...originalModule,
    useReactToPrint: jest.fn(),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn().mockImplementation(() => ({
      printIdentifierStickerFields: ['name', 'identifier', 'age', 'dateOfBirth', 'gender'],
    })),
  };
});

describe('PrintIdentifierSticker', () => {
  test('renders the component', () => {
    renderPrintIdentifierSticker();

    expect(screen.getByText(/Print Identifier Sticker/i)).toBeInTheDocument();
    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText('100GEJ')).toBeInTheDocument();
    expect(screen.getByText('1972-04-04')).toBeInTheDocument();
  });

  test('calls closeModal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    renderPrintIdentifierSticker();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeInTheDocument();

    await user.click(cancelButton);
    expect(mockedCloseModal).toHaveBeenCalled();
  });

  test('calls the print function when print button is clicked', async () => {
    const handlePrint = jest.fn();
    mockedUseReactToPrint.mockReturnValue(handlePrint);

    const user = userEvent.setup();

    renderPrintIdentifierSticker();

    const printButton = screen.getByRole('button', { name: /Print/i });
    expect(printButton).toBeInTheDocument();

    await user.click(printButton);
    expect(handlePrint).toHaveBeenCalled();
  });
});
function renderPrintIdentifierSticker() {
  render(<PrintIdentifierSticker patient={mockPatient} closeModal={mockedCloseModal} />);
}
