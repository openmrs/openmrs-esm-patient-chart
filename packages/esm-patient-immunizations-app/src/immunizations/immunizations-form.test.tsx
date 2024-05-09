import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImmunizationsForm from './immunizations-form.workspace';
import { mockPatient } from 'tools';
import { savePatientImmunization } from './immunizations.resource';
import { immunizationFormSub } from './utils';
import { showSnackbar } from '@openmrs/esm-framework';

const mockCloseWorkspace = jest.fn();
const mockCloseWorkspaceWithSavedChanges = jest.fn();
const mockPromptBeforeClosing = jest.fn();
const mockSavePatientImmunization = savePatientImmunization as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  toOmrsIsoString: jest.fn(),
  toDateObjectStrict: jest.fn(),
  useConfig: jest.fn(() => ({
    immunizationsConfig: {
      vaccinesConceptSet: 'CIEL:984',
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
  })),
  useSession: jest.fn(() => ({
    sessionLocation: { uuid: '8d94f852-c2cc-11de-8d13-0010c6dffd0f' },
    currentProvider: { uuid: '44c3efb0-2583-4c80-a79e-1f756a03c0a1' },
  })),
  useVisit: jest.fn(() => ({
    currentVisit: {
      uuid: '78d8f281-e7bb-4b5e-a056-2b46a7fe5555',
    },
  })),
}));

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
  closeWorkspace: mockCloseWorkspace,
  closeWorkspaceWithSavedChanges: mockCloseWorkspaceWithSavedChanges,
  promptBeforeClosing: mockPromptBeforeClosing,
};

describe('Immunizations Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render ImmunizationsForm component', () => {
    renderImmunizationForm();

    expect(screen.getByRole('textbox', { name: /Vaccination Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Immunization/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Manufacturer/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Lot Number/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Expiration Date/i })).toBeInTheDocument();
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
    renderImmunizationForm();

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
    renderImmunizationForm();
    const formValues = {
      vaccineUuid: '886AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      doseNumber: 1,
      manufacturer: 'Pfizer',
    };

    mockSavePatientImmunization.mockReturnValue(
      Promise.resolve({
        status: 201,
        ok: true,
        data: {
          id: '24c3efb0-2583-4c80-a79e-1f75Ma03c0a1',
        },
      } as any),
    );

    // fill up the form
    const vaccineField = screen.getByRole('combobox', { name: /Immunization/i });
    await selectOption(vaccineField, 'Hepatitis B vaccination');
    const doseField = screen.getByRole('spinbutton', { name: /Dose number within series/i });
    await user.type(doseField, formValues.doseNumber.toString());
    const manufacturer = screen.getByRole('textbox', { name: /Manufacturer/i });
    await user.type(manufacturer, formValues.manufacturer);
    const saveButton = screen.getByRole('button', { name: /Save/i });

    await user.click(saveButton);

    expect(mockSavePatientImmunization).toHaveBeenCalledTimes(1);
    expect(mockSavePatientImmunization).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceType: 'Immunization',
        status: 'completed',
        vaccineCode: { coding: [{ code: '782AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Hepatitis B vaccination' }] },
        patient: { type: 'Patient', reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e' },
        encounter: { type: 'Encounter', reference: 'Encounter/78d8f281-e7bb-4b5e-a056-2b46a7fe5555' },
        location: { type: 'Location', reference: 'Location/8d94f852-c2cc-11de-8d13-0010c6dffd0f' },
        performer: [
          { actor: { type: 'Practitioner', reference: 'Practitioner/44c3efb0-2583-4c80-a79e-1f756a03c0a1' } },
        ],
        manufacturer: { display: 'Pfizer' },
        protocolApplied: [{ doseNumberPositiveInt: 1, series: null }],
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
      vaccinationDate: new Date('2024-01-03T15:44:17'),
      doseNumber: 24,
      expirationDate: new Date('2024-05-19T21:00:00'),
      lotNumber: 'A123456',
      manufacturer: 'Merck & Co., Inc.',
      visitId: 'ce589c9c-2f30-42ec-b289-a153f812ea5e',
    };
    immunizationFormSub.next(immunizationToEdit);
    mockSavePatientImmunization.mockReturnValue(
      Promise.resolve({
        status: 201,
        ok: true,
        data: {
          id: immunizationToEdit.immunizationId,
        },
      } as any),
    );

    renderImmunizationForm();

    const vaccinationDateField = screen.getByRole('textbox', { name: /Vaccination Date/i });
    const vaccinationTimeField = screen.getByRole('textbox', { name: /Time/i });
    const vaccineField = screen.getByRole('combobox', { name: /Immunization/i });
    const doseField = screen.getByRole('spinbutton', { name: /Dose number within series/i });
    const lotField = screen.getByRole('textbox', { name: /Lot number/i });
    const manufacturerField = screen.getByRole('textbox', { name: /Manufacturer/i });
    const expirationDateField = screen.getByRole('textbox', { name: /Expiration Date/i });
    const saveButton = screen.getByRole('button', { name: /Save/i });

    // verify the form values
    expect(vaccinationDateField).toHaveValue('03/01/2024');
    expect(vaccinationTimeField).toHaveValue('03:44');
    expect(vaccineField.title).toBe('Bacillus Calmette–Guérin vaccine');
    expect(doseField).toHaveValue(24);
    expect(lotField).toHaveValue('A123456');
    expect(manufacturerField).toHaveValue('Merck & Co., Inc.');
    expect(expirationDateField).toHaveValue('19/05/2024');

    // edit the form
    await selectOption(vaccineField, 'Hepatitis B vaccination');
    await user.clear(doseField);
    await user.type(doseField, '2');

    await user.click(saveButton);

    expect(mockSavePatientImmunization).toHaveBeenCalledTimes(1);
    expect(mockSavePatientImmunization).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceType: 'Immunization',
        status: 'completed',
        vaccineCode: { coding: [{ code: '782AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', display: 'Hepatitis B vaccination' }] },
        patient: { type: 'Patient', reference: 'Patient/8673ee4f-e2ab-4077-ba55-4980f408773e' },
        encounter: { type: 'Encounter', reference: 'Encounter/ce589c9c-2f30-42ec-b289-a153f812ea5e' },
        location: { type: 'Location', reference: 'Location/8d94f852-c2cc-11de-8d13-0010c6dffd0f' },
        performer: [
          { actor: { type: 'Practitioner', reference: 'Practitioner/44c3efb0-2583-4c80-a79e-1f756a03c0a1' } },
        ],
        manufacturer: { display: 'Merck & Co., Inc.' },
        protocolApplied: [{ doseNumberPositiveInt: 2, series: null }],
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

function renderImmunizationForm() {
  render(<ImmunizationsForm {...testProps} />);
}

async function selectOption(dropdown: HTMLElement, optionLabel: string) {
  const user = userEvent.setup();
  await user.click(dropdown);
  await user.click(screen.getByText(optionLabel));
}
