import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, waitFor } from '@testing-library/react';
import { of } from 'rxjs/internal/observable/of';
import { showNotification, showToast, useConfig } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { mockAllergensAndAllergicReactions, mockAllergyResult } from '../../../../../__mocks__/allergies.mock';
import { fetchAllergensAndAllergicReactions, saveAllergy } from './allergy-form.resource';
import AllergyForm from './allergy-form.component';

const mockUseConfig = useConfig as jest.Mock;
const mockFetchAllergensAndAllergicReactions = fetchAllergensAndAllergicReactions as jest.Mock;
const mockSaveAllergy = saveAllergy as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;

jest.mock('./allergy-form.resource', () => ({
  fetchAllergensAndAllergicReactions: jest.fn(),
  saveAllergy: jest.fn(),
}));

describe('AllergyForm ', () => {
  it('renders the allergy form with all the expected fields and values', async () => {
    mockFetchAllergensAndAllergicReactions.mockReturnValueOnce(of(mockAllergensAndAllergicReactions));

    renderAllergyForm();

    expect(screen.getByRole('heading', { name: /allergens and reactions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /select the allergens/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /select the reactions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /severity and date of onset/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /severity of worst reaction/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /date and comments/i })).toBeInTheDocument();

    const tabNames = [/drug/i, /food/i, /environmental/i];
    tabNames.map((tabName) => {
      expect(screen.getByRole('tab', { name: tabName })).toBeInTheDocument();
      userEvent.click(screen.getByRole('tab', { name: tabName }));
      expect(screen.getByRole('tab', { name: tabName })).toBeChecked;
    });

    userEvent.click(screen.getByRole('tab', { name: /drug/i }));
    expect(screen.getByRole('tab', { name: /drug/i })).toBeChecked;
    expect(screen.getByRole('radio', { name: /ace inhibitors/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /mild/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /moderate/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /severe/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /anaemia/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /date of first onset/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /comments/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeDisabled();

    userEvent.click(screen.getByRole('checkbox', { name: /cough/i }));
    expect(screen.getByRole('checkbox', { name: /cough/i })).toBeChecked;

    userEvent.click(screen.getByRole('checkbox', { name: /cough/i }));
    expect(screen.getByRole('checkbox', { name: /cough/i })).not.toBeChecked;

    await waitFor(() => userEvent.click(screen.getByRole('checkbox', { name: /Other/i })));
    // expect(screen.getByTitle(/Please type in the name of the allergic reaction/i)).toBeInTheDocument();
    // expect(screen.getByRole('textbox', { name: /Other non-coded allergic reaction/i }));

    // userEvent.type(screen.getByRole('textbox', { name: /Other non-coded allergic reaction/i }), 'fatigue');
    // expect(screen.getByDisplayValue('fatigue')).toBeInTheDocument();

    userEvent.type(screen.getByRole('textbox', { name: /Comments/i }), 'Painful joints');
    expect(screen.getByDisplayValue('Painful joints')).toBeInTheDocument();

    await waitFor(() => userEvent.click(screen.getByRole('radio', { name: /Other Other Other/i })));
    expect(screen.getByRole('textbox', { name: /Other non-coded allergen/i }));
    expect(screen.getByTitle(/Please type in the name of the allergen/i)).toBeInTheDocument();

    userEvent.type(screen.getByRole('textbox', { name: /Other non-coded allergen/i }), 'plastics');
    expect(screen.getByDisplayValue('plastics')).toBeInTheDocument();
  });

  describe('Form submission: ', () => {
    it('renders a success notification after successful submission', async () => {
      mockFetchAllergensAndAllergicReactions.mockReturnValueOnce(of(mockAllergensAndAllergicReactions));
      mockSaveAllergy.mockResolvedValueOnce({ data: mockAllergyResult, status: 201, statusText: 'Created' });

      renderAllergyForm();

      userEvent.click(screen.getByRole('radio', { name: /ace inhibitors/i }));
      userEvent.click(screen.getByRole('checkbox', { name: /cough/i }));
      userEvent.click(screen.getByRole('radio', { name: /moderate/i }));
      userEvent.type(screen.getByRole('textbox', { name: /date of first onset/i }), '02/01/2022');

      await waitFor(() => userEvent.click(screen.getByRole('button', { name: /save and close/i })));

      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith({
        critical: true,
        kind: 'success',
        title: 'Allergy saved',
        description: 'It is now visible on the Allergies page',
      });
    });

    it('renders an error notification upon an invalid submission', async () => {
      mockFetchAllergensAndAllergicReactions.mockReturnValueOnce(of(mockAllergensAndAllergicReactions));
      mockSaveAllergy.mockRejectedValueOnce({
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      });

      renderAllergyForm();

      userEvent.click(screen.getByRole('radio', { name: /ace inhibitors/i }));
      userEvent.click(screen.getByRole('checkbox', { name: /cough/i }));
      userEvent.click(screen.getByRole('radio', { name: /moderate/i }));
      userEvent.type(screen.getByRole('textbox', { name: /date of first onset/i }), '02/01/2022');

      await waitFor(() => userEvent.click(screen.getByRole('button', { name: /save and close/i })));

      expect(mockShowNotification).toHaveBeenCalledTimes(1);
      expect(mockShowNotification).toHaveBeenCalledWith({
        critical: true,
        description: 'Internal Server Error',
        kind: 'error',
        title: 'Error saving allergy',
      });
    });
  });
});

const testProps = {
  closeWorkspace: () => {},
  promptBeforeClosing: () => {},
  patient: mockPatient,
  patientUuid: mockPatient.id,
};

function renderAllergyForm() {
  mockUseConfig.mockReturnValue({
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
  });

  render(<AllergyForm {...testProps} />);
}
