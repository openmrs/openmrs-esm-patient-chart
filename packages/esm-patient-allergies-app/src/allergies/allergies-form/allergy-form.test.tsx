import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { mockAllergensAndAllergicReactions, mockAllergyResult } from '../../__mocks__/allergies.mock';
import { mockPatient } from '../../../../../tools/test-helpers';
import { saveAllergy, useAllergensAndAllergicReactions } from './allergy-form.resource';
import AllergyForm from './allergy-form.component';

const mockSaveAllergy = saveAllergy as jest.Mock;
const mockShowSnackbar = showSnackbar as jest.Mock;
const mockUseAllergensAndAllergicReactions = useAllergensAndAllergicReactions as jest.Mock;

jest.setTimeout(15000);

jest.mock('./allergy-form.resource', () => {
  const originalModule = jest.requireActual('./allergy-form.resource');

  return {
    ...originalModule,
    saveAllergy: jest.fn(),
    useAllergensAndAllergicReactions: jest.fn(),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
    useConfig: jest.fn().mockImplementation(() => ({
      concepts: {
        drugAllergenUuid: '162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        environmentalAllergenUuid: '162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        foodAllergenUuid: '162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        mildReactionUuid: '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        moderateReactionUuid: '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        severeReactionUuid: '1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        allergyReactionUuid: '162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        otherConceptUuid: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      },
    })),
  };
});

describe('AllergyForm ', () => {
  it('renders the allergy form with all the expected fields and values', async () => {
    const user = userEvent.setup();

    mockUseAllergensAndAllergicReactions.mockReturnValue({
      isLoading: false,
      allergensAndAllergicReactions: mockAllergensAndAllergicReactions,
    });

    renderAllergyForm();

    expect(screen.getByRole('heading', { name: /allergens and reactions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /select the allergens/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /select the reactions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /severity and date of onset/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /severity of worst reaction/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /date and comments/i })).toBeInTheDocument();

    const tabNames = [/drug/i, /food/i, /environmental/i];

    tabNames.map((tabName) => expect(screen.getByRole('tab', { name: tabName })).toBeInTheDocument());

    await user.click(screen.getByRole('tab', { name: /drug/i }));

    expect(screen.getByRole('tab', { name: /drug/i })).toBeChecked;
    expect(screen.getByRole('radio', { name: /ace inhibitors/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /mild/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /moderate/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /severe/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /anaemia/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /date of onset and comments/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeDisabled();
  });

  xit('renders a success Snackbar after successful submission', async () => {
    const user = userEvent.setup();

    mockSaveAllergy.mockResolvedValueOnce({ data: mockAllergyResult, status: 201, statusText: 'Created' });

    renderAllergyForm();

    await user.click(screen.getByRole('radio', { name: /ace inhibitors/i }));
    await user.click(screen.getByRole('checkbox', { name: /cough/i }));
    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Allergy saved',
      subtitle: 'It is now visible on the Allergies page',
    });
  });

  xit('renders an error snackbar upon an invalid submission', async () => {
    const user = userEvent.setup();

    mockSaveAllergy.mockRejectedValue({
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    });

    renderAllergyForm();

    await user.click(screen.getByRole('radio', { name: /ace inhibitors/i }));
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      critical: true,
      description: 'Internal Server Error',
      kind: 'error',
      title: 'Error saving allergy',
    });
  });
});

function renderAllergyForm() {
  const testProps = {
    closeWorkspace: () => {},
    promptBeforeClosing: () => {},
    patient: mockPatient,
    patientUuid: mockPatient.id,
  };

  render(<AllergyForm {...testProps} />);
}
