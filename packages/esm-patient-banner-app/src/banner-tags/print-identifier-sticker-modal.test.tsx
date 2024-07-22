import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockPatient } from 'tools';
import PrintIdentifierStickerModal from './print-identifier-sticker.modal';

const mockCloseModal = jest.fn();
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  printIdentifierStickerFields: ['name', 'identifier', 'age', 'dateOfBirth', 'gender'],
});

describe('PrintIdentifierSticker', () => {
  test('renders a modal with patient details and print options', async () => {
    const user = userEvent.setup();

    render(<PrintIdentifierStickerModal patient={mockPatient} closeModal={mockCloseModal} />);

    expect(screen.getByRole('heading', { name: /print identifier sticker/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show preview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /no. of patient id sticker columns/i })).toHaveValue(3);
    expect(screen.getByRole('spinbutton', { name: /no. of patient id sticker rows per page/i })).toHaveValue(5);
    expect(screen.getByRole('spinbutton', { name: /no. of patient id stickers/i })).toHaveValue(30);

    const modalBody = screen.getByRole('region');
    expect(modalBody).toHaveTextContent(/john wilson/i);
    expect(modalBody).toHaveTextContent(/old identification number/i);
    expect(modalBody).toHaveTextContent(/100732he/i);
    expect(modalBody).toHaveTextContent(/openmrs id/i);
    expect(modalBody).toHaveTextContent(/100gej/i);
    expect(modalBody).toHaveTextContent(/sex/i);
    expect(modalBody).toHaveTextContent(/male/i);
    expect(modalBody).toHaveTextContent(/dob/i);
    expect(modalBody).toHaveTextContent(/1972-04-04/i);
    expect(modalBody).toHaveTextContent(/age/i);
    expect(modalBody).toHaveTextContent(/52 yrs/i);
    await user.click(screen.getByRole('button', { name: /show preview/i }));
    expect(screen.getByRole('button', { name: /hide preview/i })).toBeInTheDocument();
  });
});
