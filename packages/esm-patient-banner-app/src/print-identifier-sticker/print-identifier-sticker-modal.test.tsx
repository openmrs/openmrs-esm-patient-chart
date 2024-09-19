import React from 'react';
import { render, screen } from '@testing-library/react';
import PrintIdentifierSticker from './print-identifier-sticker.modal';
import { mockFhirPatient } from '../../../../__mocks__/patient.mock';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import { useReactToPrint } from 'react-to-print';
import userEvent from '@testing-library/user-event';
import Barcode from 'react-barcode';
import { getByTextWithMarkup } from 'tools';

const mockedCloseModal = jest.fn();
const mockedUseConfig = jest
  .mocked(useConfig<ConfigObject>)
  .mockResolvedValue(getDefaultsFromConfigSchema(configSchema));
jest.mock('react-to-print', () => ({
  ...jest.requireActual('react-to-print'),
  useReactToPrint: jest.fn(),
}));
const mockedUseReactToPrint = jest.mocked(useReactToPrint);

jest.mock('react-barcode', () => jest.fn().mockReturnValue(<div data-testid="barcode" />));

describe('Testing PrintIdentifierStickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
  });
  it('should render PrintIdentifierStickerModal', async () => {
    const user = userEvent.setup();
    const mockHandlePrint = jest.fn();
    mockedUseReactToPrint.mockReturnValue(mockHandlePrint);
    renderPrintIdentifierStickerModal();
    expect(screen.getByText(/print identifier sticker/i)).toBeInTheDocument();
    const printButton = screen.getByRole('button', { name: /print/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(mockedCloseModal).toHaveBeenCalled();
    await user.click(printButton);
    expect(mockHandlePrint).toHaveBeenCalled();
  });
  it('should render barcode if enabled via config', async () => {
    const defaultConfig = getDefaultsFromConfigSchema(configSchema) as ConfigObject;
    mockedUseConfig.mockReturnValue({
      ...defaultConfig,
      printPatientSticker: {
        ...defaultConfig.printPatientSticker,
        header: {
          showBarcode: true,
          showLogo: true,
          logo: '',
        },
      },
    });
    renderPrintIdentifierStickerModal();
    expect(screen.getByTestId('barcode')).toBeInTheDocument();
    expect(Barcode).toHaveBeenCalledWith(
      {
        value: '100008E',
        width: 2,
        background: '#f4f4f4',
        displayValue: true,
        renderer: 'img',
        font: 'IBM Plex Sans',
        textAlign: 'center',
        textPosition: 'bottom',
        fontSize: 16,
      },
      {},
    );
    expect(screen.getByTestId('openmrs-logo')).toBeInTheDocument();
  });
  it("should not render barcode if it's disabled via config", async () => {
    const defaultConfig = getDefaultsFromConfigSchema(configSchema) as ConfigObject;
    mockedUseConfig.mockReturnValue({
      ...defaultConfig,
      printPatientSticker: {
        ...defaultConfig.printPatientSticker,
        header: {
          showBarcode: false,
          showLogo: false,
          logo: '',
        },
      },
    });
    renderPrintIdentifierStickerModal();
    expect(screen.queryByTestId('barcode')).not.toBeInTheDocument();
    expect(screen.queryByTestId('openmrs-logo')).not.toBeInTheDocument();
  });
  it('should render implementation logo if passed via config', () => {
    const defaultConfig = getDefaultsFromConfigSchema(configSchema) as ConfigObject;
    mockedUseConfig.mockReturnValue({
      ...defaultConfig,
      printPatientSticker: {
        ...defaultConfig.printPatientSticker,
        header: {
          showBarcode: true,
          showLogo: true,
          logo: '/openmrs/spa/logo.png',
        },
      },
    });
    renderPrintIdentifierStickerModal();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/openmrs/spa/logo.png');
  });

  it('should render patient details', () => {
    renderPrintIdentifierStickerModal();
    expect(getByTextWithMarkup(/Joshua Johnson/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/\+255777053243/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/100008E/i)).toBeInTheDocument();
    expect(getByTextWithMarkup(/4 yrs, 11 mths/i)).toBeInTheDocument();
  });
});

function renderPrintIdentifierStickerModal() {
  return render(<PrintIdentifierSticker closeModal={mockedCloseModal} patient={mockFhirPatient} />);
}
