import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, showSnackbar, useConfig, UserHasAccess } from '@openmrs/esm-framework';
import { mockFhirPatient } from '__mocks__';
import { renderWithSwr } from 'tools';
import { useStickerPdfPrinter } from '../hooks/useStickerPdfPrinter';
import { configSchema, type ConfigObject } from '../config-schema';
import PrintIdentifierStickerOverflowMenuItem from './print-identifier-sticker-action-button.component';

jest.mock('../hooks/useStickerPdfPrinter');

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseStickerPdfPrinter = jest.mocked(useStickerPdfPrinter);
const mockUserHasAccess = jest.mocked(UserHasAccess);
const mockPrintPdf = jest.fn();

describe('PrintIdentifierStickerOverflowMenuItem', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showPrintIdentifierStickerButton: true,
    } as ConfigObject);
    mockPrintPdf.mockResolvedValue(undefined);
    mockUseStickerPdfPrinter.mockReturnValue({
      printPdf: mockPrintPdf,
      isPrinting: false,
    });
  });

  it('renders the print button when enabled in config', () => {
    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={mockFhirPatient} />);

    expect(screen.getByRole('menuitem', { name: /print identifier sticker/i })).toBeInTheDocument();
  });

  it('does not render the button when disabled in config', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showPrintIdentifierStickerButton: false,
    } as ConfigObject);

    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={mockFhirPatient} />);

    expect(screen.queryByRole('menuitem', { name: /print identifier sticker/i })).not.toBeInTheDocument();
  });

  it('does not render the button when patient ID is missing', () => {
    const patientWithoutId = { ...mockFhirPatient, id: undefined } as fhir.Patient;

    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={patientWithoutId} />);

    expect(screen.queryByRole('menuitem', { name: /print identifier sticker/i })).not.toBeInTheDocument();
  });

  it('triggers print when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={mockFhirPatient} />);

    const printButton = screen.getByRole('menuitem', { name: /print identifier sticker/i });
    await user.click(printButton);

    expect(mockPrintPdf).toHaveBeenCalledTimes(1);
    expect(mockPrintPdf).toHaveBeenCalledWith(expect.stringContaining(mockFhirPatient.id));
  });

  it('shows error notification when print fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network error';
    mockPrintPdf.mockRejectedValueOnce(new Error(errorMessage));

    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={mockFhirPatient} />);

    const printButton = screen.getByRole('menuitem', { name: /print identifier sticker/i });
    await user.click(printButton);

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      kind: 'error',
      title: 'Print error',
      subtitle: expect.stringContaining(errorMessage),
    });
  });

  it('shows loading state when printing', () => {
    mockUseStickerPdfPrinter.mockReturnValue({
      printPdf: mockPrintPdf,
      isPrinting: true,
    });

    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={mockFhirPatient} />);

    const printButton = screen.getByRole('menuitem', { name: /printing/i });
    expect(printButton).toBeInTheDocument();
    expect(printButton).toBeDisabled();
  });

  it('prevents multiple print calls when already printing', async () => {
    const user = userEvent.setup();
    mockUseStickerPdfPrinter.mockReturnValue({
      printPdf: mockPrintPdf,
      isPrinting: true,
    });

    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={mockFhirPatient} />);

    const printButton = screen.getByRole('menuitem', { name: /printing/i });
    await user.click(printButton);

    expect(mockPrintPdf).not.toHaveBeenCalled();
  });

  it('checks for the correct privilege when rendering', () => {
    renderWithSwr(<PrintIdentifierStickerOverflowMenuItem patient={mockFhirPatient} />);

    expect(mockUserHasAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        privilege: 'App: Can generate a Patient Identity Sticker',
      }),
      expect.anything(),
    );
  });
});
