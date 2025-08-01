import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import {
  getDefaultsFromConfigSchema,
  showSnackbar,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
  useSession,
  useVisit,
} from '@openmrs/esm-framework';
import { configSchema } from '../config-schema';
import { type ImmunizationWidgetConfigObject } from '../types/fhir-immunization-domain';
import { immunizationFormSub } from './utils';
import { mockCurrentVisit, mockSessionDataResponse } from '__mocks__';

import { mockPatient } from 'tools';
import { savePatientImmunization } from './immunizations.resource';

import ImmunizationsForm from './immunizations-form.workspace';

const mockCloseWorkspace = jest.fn();
const mockCloseWorkspaceWithSavedChanges = jest.fn();
const mockPromptBeforeClosing = jest.fn();
const mockSavePatientImmunization = savePatientImmunization as jest.Mock;
const mockSetTitle = jest.fn();
const mockUseConfig = jest.mocked<() => { immunizationsConfig: ImmunizationWidgetConfigObject }>(useConfig);
const mockUseSession = jest.mocked(useSession);
const mockUseVisit = jest.mocked(useVisit);
const mockMutate = jest.fn();
const mockToOmrsIsoString = jest.mocked(toOmrsIsoString);
const mockToDateObjectStrict = jest.mocked(toDateObjectStrict);

jest.mock('../hooks/useImmunizationsConceptSet', () => ({
  useImmunizationsConceptSet: jest.fn(() => ({
    immunizationsConceptSet: {
      uuid: '984AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      display: 'Immunizations',
      answers: [
        {
          uuid: '886AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Bacillus Calmette–Guérin vaccine',
        },
        {
          uuid: '783AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Polio vaccination, oral',
        },
        {
          uuid: '781AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Diphtheria tetanus and pertussis vaccination',
        },
        {
          uuid: '782AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hepatitis B vaccination',
        },
        {
          uuid: '5261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          display: 'Hemophilus influenza B vaccine',
        },
      ],
    },
    isLoading: false,
  })),
}));

jest.mock('./immunizations.resource', () => ({
  savePatientImmunization: jest.fn(),
}));

const testProps = {
  patientUuid: mockPatient.id,
  patient: mockPatient,
  closeWorkspace: mockCloseWorkspace,
  closeWorkspaceWithSavedChanges: mockCloseWorkspaceWithSavedChanges,
  promptBeforeClosing: mockPromptBeforeClosing,
  setTitle: mockSetTitle,
};

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  immunizationsConfig: {
    immunizationConceptSet: '984AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    sequenceDefinitions: [
      {
        vaccineConceptUuid: '783AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        sequences: [
          { sequenceLabel: 'Dose-1', sequenceNumber: 1 },
          { sequenceLabel: 'Dose-2', sequenceNumber: 2 },
          { sequenceLabel: 'Dose-3', sequenceNumber: 3 },
          { sequenceLabel: 'Dose-4', sequenceNumber: 4 },
          { sequenceLabel: 'Booster-1', sequenceNumber: 11 },
          { sequenceLabel: 'Booster-2', sequenceNumber: 12 },
        ],
      },
    ],
  },
});

mockUseSession.mockReturnValue(mockSessionDataResponse.data);
mockUseVisit.mockReturnValue({
  activeVisit: mockCurrentVisit,
  currentVisit: mockCurrentVisit,
  currentVisitIsRetrospective: false,
  error: null,
  isLoading: false,
  isValidating: false,
  mutate: mockMutate,
});

describe('Immunizations Form', () => {
  const isoFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const mockVaccinationDate = new Date('2024-01-03');

  beforeEach(() => {
    mockToOmrsIsoString.mockReturnValue(mockVaccinationDate.toISOString());
    mockToDateObjectStrict.mockImplementation((dateString) => dayjs(dateString, isoFormat).toDate());
  });

  it('should render ImmunizationsForm component', () => {
    render(<ImmunizationsForm {...testProps} />);

    // TODO: use better selector
    // expect(screen.getByTestId('vaccinationDate')).toBeInTheDocument();
    expect(screen.getByLabelText(/vaccination date/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Immunization/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /note/i })).toBeInTheDocument();
    expect(screen.getByText(/Vaccine Batch Information/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Manufacturer/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Lot Number/i })).toBeInTheDocument();

    // TODO: use better selector
    // expect(screen.getByTestId('vaccinationExpiration')).toBeInTheDocument();
    expect(screen.getByLabelText(/expiration date/i)).toBeInTheDocument();
  });

  it('should render dose field appropriately', async () => {
    function verifyDoseFieldType(type: 'sequence-coded' | 'number', shouldExist: boolean) {
      const field =
        type === 'sequence-coded'
          ? screen.queryByRole('combobox', { name: /Sequence/i })
          : screen.queryByRole('spinbutton', { name: /Dose number within series/i });
      if (shouldExist) {
        expect(field).toBeInTheDocument();
      } else {
        expect(field).not.toBeInTheDocument();
      }
    }
    render(<ImmunizationsForm {...testProps} />);

    verifyDoseFieldType('sequence-coded', false);
    verifyDoseFieldType('number', false);

    const vaccinesDropdown = screen.getByRole('combobox', { name: /Immunization/i });

    // select a vaccine without configured sequences
    await selectOption(vaccinesDropdown, 'Hepatitis B vaccination');

    verifyDoseFieldType('number', true);
    verifyDoseFieldType('sequence-coded', false);

    // select a vaccine with configured sequences
    await selectOption(vaccinesDropdown, 'Polio vaccination, oral');

    verifyDoseFieldType('number', false);
    verifyDoseFieldType('sequence-coded', true);
  });

  it('should save immunization data on submit', async () => {
    const user = userEvent.setup();

    render(<ImmunizationsForm {...testProps} />);

    const formValues = {
      vaccineUuid: '886AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      doseNumber: 1,
      manufacturer: 'Pfizer',
      note: 'Given as part of routine schedule.',
    };

    mockSavePatientImmunization.mockResolvedValue({
      status: 201,
      ok: true,
      data: {
        id: '24c3efb0-2583-4c80-a79e-1f75Ma03c0a1',
      },
    });

    // fill up the form
    const vaccineField = screen.getByRole('combobox', { name: /Immunization/i });
    await selectOption(vaccineField, 'Hepatitis B vaccination');
    const doseField = screen.getByRole('spinbutton', { name: /Dose number within series/i });
    await user.clear(doseField);
    await user.type(doseField, formValues.doseNumber.toString());
    const NoteField = screen.getByRole('textbox', { name: /note/i });
    await user.clear(NoteField);
    await user.type(NoteField, formValues.note);
    const manufacturer = screen.getByRole('textbox', { name: /Manufacturer/i });
    await user.type(manufacturer, formValues.manufacturer);
    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    expect(mockSavePatientImmunization).toHaveBeenCalledTimes(1);
    expect(mockSavePatientImmunization).toHaveBeenCalledWith(
      expect.objectContaining({
        encounter: { reference: 'Encounter/17f512b4-d264-4113-a6fe-160cb38cb46e', type: 'Encounter' },
        expirationDate: null,
        note: [{ text: formValues.note }],
        id: undefined,
        location: { reference: 'Location/b1a8b05e-3542-4037-bbd3-998ee9c40574', type: 'Location' },
        lotNumber: '',
        manufacturer: { display: 'Pfizer' },
        occurrenceDateTime: mockVaccinationDate,
        patient: { reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e', type: 'Patient' },
        performer: [
          { actor: { reference: 'Practitioner/b1a8b05e-3542-4037-bbd3-998ee9c4057z', type: 'Practitioner' } },
        ],
        protocolApplied: [{ doseNumberPositiveInt: 1, series: null }],
        resourceType: 'Immunization',
        status: 'completed',
        vaccineCode: { coding: [{ code: '782AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Hepatitis B vaccination' }] },
      }),
      undefined,
      new AbortController(),
    );
    expect(showSnackbar).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Vaccination saved successfully',
    });
  });

  it('should support editing immunizations', async () => {
    const user = userEvent.setup();
    // setup and render the form
    const immunizationToEdit = {
      vaccineUuid: '886AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      immunizationId: '0a6ca2bb-a317-49d8-bd6b-dabb658840d2',
      vaccinationDate: new Date('2024-01-03'),
      doseNumber: 2,
      expirationDate: new Date('2024-05-19'),
      note: 'Given as part of routine schedule.',
      lotNumber: 'A123456',
      manufacturer: 'Merck & Co., Inc.',
      visitId: 'ce589c9c-2f30-42ec-b289-a153f812ea5e',
    };
    immunizationFormSub.next(immunizationToEdit);
    mockSavePatientImmunization.mockResolvedValue({
      status: 201,
      ok: true,
      data: {
        id: immunizationToEdit.immunizationId,
      },
    });

    render(<ImmunizationsForm {...testProps} />);

    const vaccinationDateField = screen.getByRole('textbox', { name: /vaccination date/i });
    const vaccineField = screen.getByRole('combobox', { name: /Immunization/i });
    const doseField = screen.getByRole('spinbutton', { name: /Dose number within series/i });
    const lotField = screen.getByRole('textbox', { name: /Lot number/i });
    const NoteField = screen.getByRole('textbox', { name: /note/i });
    const manufacturerField = screen.getByRole('textbox', { name: /Manufacturer/i });
    const expirationDateField = screen.getByRole('textbox', { name: /Expiration date/i });
    const saveButton = screen.getByRole('button', { name: /Save/i });

    // verify the form values
    expect(vaccinationDateField).toHaveDisplayValue(/03\/01\/2024/i);

    expect(vaccineField).toBeDisabled();
    expect(vaccineField).toHaveAttribute('title', 'Bacillus Calmette–Guérin vaccine');
    expect(doseField).toHaveValue(2);
    expect(lotField).toHaveValue('A123456');
    expect(manufacturerField).toHaveValue('Merck & Co., Inc.');
    expect(expirationDateField).toHaveValue('19/05/2024');

    // edit the form
    await user.clear(doseField);
    await user.type(doseField, '2');
    await user.click(saveButton);

    expect(mockSavePatientImmunization).toHaveBeenCalledTimes(1);
    expect(mockSavePatientImmunization).toHaveBeenCalledWith(
      expect.objectContaining({
        encounter: { reference: 'Encounter/ce589c9c-2f30-42ec-b289-a153f812ea5e', type: 'Encounter' },
        id: '0a6ca2bb-a317-49d8-bd6b-dabb658840d2',
        expirationDate: dayjs(new Date('2024-05-19'), isoFormat).toDate(),
        note: [{ text: immunizationToEdit.note }],
        location: { reference: 'Location/b1a8b05e-3542-4037-bbd3-998ee9c40574', type: 'Location' },
        lotNumber: 'A123456',
        manufacturer: { display: 'Merck & Co., Inc.' },
        occurrenceDateTime: dayjs(mockVaccinationDate, isoFormat).toDate(),
        patient: { reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e', type: 'Patient' },
        performer: [
          { actor: { reference: 'Practitioner/b1a8b05e-3542-4037-bbd3-998ee9c4057z', type: 'Practitioner' } },
        ],
        protocolApplied: [{ doseNumberPositiveInt: 2, series: null }],
        resourceType: 'Immunization',
        status: 'completed',
        vaccineCode: {
          coding: [{ code: '886AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Bacillus Calmette–Guérin vaccine' }],
        },
      }),
      '0a6ca2bb-a317-49d8-bd6b-dabb658840d2',
      new AbortController(),
    );
    expect(showSnackbar).toHaveBeenCalledTimes(1);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Vaccination saved successfully',
    });
  });
});

async function selectOption(dropdown: HTMLElement, optionLabel: string) {
  const user = userEvent.setup();
  await user.click(dropdown);
  await user.click(screen.getByText(optionLabel));
}
