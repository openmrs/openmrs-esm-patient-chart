import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { esmPatientChartSchema, type ChartConfig } from '../config-schema';
import { mockPatient } from 'tools';
import { markPatientDeceased, useCausesOfDeath } from '../data.resource';
import MarkPatientDeceasedForm from './mark-patient-deceased-form.workspace';

const originalLocation = window.location;
delete window.location;
window.location = { ...originalLocation, reload: jest.fn() };

const mockMarkPatientDeceased = jest.mocked(markPatientDeceased);
const mockUseCausesOfDeath = jest.mocked(useCausesOfDeath);
const mockUseConfig = jest.mocked(useConfig<ChartConfig>);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockCloseWorkspace = jest.fn();

jest.mock('../data.resource.ts', () => ({
  markPatientDeceased: jest.fn().mockResolvedValue({}),
  useCausesOfDeath: jest.fn(),
}));

describe('MarkPatientDeceasedForm', () => {
  const freeTextFieldConceptUuid = '1234e218-6c8a-4ca3-8edb-9f6d9c8c8c7f';

  const defaultProps = {
    patientUuid: mockPatient.id,
    closeWorkspace: mockCloseWorkspace,
    closeWorkspaceWithSavedChanges: jest.fn(),
    promptBeforeClosing: jest.fn(),
    setTitle: jest.fn(),
  };

  const codedCausesOfDeath = [
    {
      display: 'Traumatic injury',
      uuid: '8b64f45e-1d5f-4894-b77c-4e1d840e2c99',
      name: 'Traumatic injury',
    },
    {
      display: 'Neoplasm/cancer',
      uuid: 'c4e8d03c-f09b-48d1-8d93-7d84d463f865',
      name: 'Neoplasm/cancer',
    },
    {
      display: 'Infectious disease',
      uuid: 'b7c1c30f-5b9e-4a3d-b943-7f4b3f740e6c',
      name: 'Infectious disease',
    },
    {
      display: 'Other',
      uuid: freeTextFieldConceptUuid,
      name: 'Other',
    },
  ];

  beforeEach(() => {
    mockUseCausesOfDeath.mockReturnValue({
      causesOfDeath: codedCausesOfDeath,
      isLoading: false,
      isValidating: false,
    });

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      freeTextFieldConceptUuid,
    });
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  it('renders the cause of death form', () => {
    render(<MarkPatientDeceasedForm {...defaultProps} />);

    expect(screen.getByRole('img', { name: /warning/i })).toBeInTheDocument();
    expect(
      screen.getByText(/marking the patient as deceased will end any active visits for this patient/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/cause of death/i)).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByTestId(/deceasedDate/i)).toBeInTheDocument();
    codedCausesOfDeath.forEach((codedCauseOfDeath) => {
      expect(screen.getByRole('radio', { name: codedCauseOfDeath.display })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
  });

  it('searches through the list when the user types in the search input', async () => {
    const user = userEvent.setup();

    render(<MarkPatientDeceasedForm {...defaultProps} />);

    const searchInput = screen.getByRole('searchbox');

    await user.type(searchInput, 'totally random text');
    expect(screen.getByText(/no matching coded causes of death/i));

    await user.clear(searchInput);
    await user.type(searchInput, 'traumatic injury');

    expect(screen.getByRole('radio', { name: 'Traumatic injury' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('selecting "Other" as the cause of death requires the user to enter a non-coded cause of death', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<MarkPatientDeceasedForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /save and close/i });

    await user.click(screen.getByRole('radio', { name: 'Other' }));
    expect(screen.getByRole('textbox', { name: /non-coded cause of death/i })).toBeInTheDocument();

    await user.click(submitButton);

    expect(screen.getByText(/please enter the non-coded cause of death/i)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /non\-coded cause of death/i }), 'Septicemia');
    await user.click(submitButton);

    expect(markPatientDeceased).toHaveBeenCalledWith(
      expect.any(Date),
      '8673ee4f-e2ab-4077-ba55-4980f408773e', // causeOfDeathUuid
      freeTextFieldConceptUuid, // otherCauseOfDeathConceptUuid
      'Septicemia', // otherCauseOfDeath
    );
    consoleError.mockRestore();
  });

  it('submits the form with a coded cause of death', async () => {
    const user = userEvent.setup();

    render(<MarkPatientDeceasedForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    const traumaticInjuryRadio = screen.getByRole('radio', { name: 'Traumatic injury' });

    await user.click(traumaticInjuryRadio);
    await user.click(submitButton);

    expect(markPatientDeceased).toHaveBeenCalledWith(
      expect.any(Date),
      '8673ee4f-e2ab-4077-ba55-4980f408773e',
      '8b64f45e-1d5f-4894-b77c-4e1d840e2c99', // causeOfDeathUuid for Traumatic injury,
      '',
    );
  });

  it('renders an error message when saving the cause of death fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const mockError = new Error('API Error');

    mockMarkPatientDeceased.mockRejectedValueOnce(mockError);

    render(<MarkPatientDeceasedForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    const traumaticInjuryRadio = screen.getByRole('radio', { name: 'Traumatic injury' });

    await user.click(traumaticInjuryRadio);
    await user.click(submitButton);

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      subtitle: mockError.message,
      title: 'Error marking patient deceased',
    });
    consoleError.mockRestore();
  });

  it('clicking the discard button closes the workspace', async () => {
    const user = userEvent.setup();

    render(<MarkPatientDeceasedForm {...defaultProps} />);

    const discardButton = screen.getByRole('button', { name: /discard/i });
    await user.click(discardButton);

    expect(mockCloseWorkspace).toHaveBeenCalledTimes(1);
  });
});
