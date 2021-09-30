import React from 'react';
import { screen, render, act, waitFor, fireEvent } from '@testing-library/react';
import AllergyForm from './allergy-form.component';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import { useConfig, showToast, showNotification } from '@openmrs/esm-framework';
import { savePatientAllergy, fetchAllergensAndReaction } from './allergy-form.resource';
import { of, throwError } from 'rxjs';
import { mockAllergenAndReactions } from '../../../../../__mocks__/allergies.mock';
import userEvent from '@testing-library/user-event';

const mockCloseWorkspace = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();
const mockConfig = useConfig as jest.Mock;
const mockSavePatientAllergy = savePatientAllergy as jest.Mock;
const mockFetchAllergensAndReaction = fetchAllergensAndReaction as jest.Mock;

const mockConcepts = {
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
};

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  showToast: jest.fn(),
  showNotification: jest.fn(),
}));

jest.mock('./allergy-form.resource', () => ({
  savePatientAllergy: jest.fn(),
  fetchAllergensAndReaction: jest.fn(),
}));

describe('<AllergyForm>', () => {
  const renderAllergyForm = () => {
    mockConfig.mockReturnValue(mockConcepts);
    mockFetchAllergensAndReaction.mockReturnValue(of(mockAllergenAndReactions));
    render(
      <AllergyForm
        closeWorkspace={mockCloseWorkspace}
        isTablet={true}
        patient={mockPatient}
        patientUuid={mockPatient.id}
      />,
    );
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should display allergy form correctly', async () => {
    renderAllergyForm();
    expect(screen.getByRole('tab', { name: /Drug/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Food/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Environmental/i })).toBeInTheDocument();

    // Display drug allergens
    expect(screen.getByRole('radio', { name: /ACE inhibitors/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Aspirin/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Cephalosporins/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Codeine/i })).toBeInTheDocument();

    // Display food allergen
    const foodAllergen = screen.getByRole('tab', { name: /Food/i });
    userEvent.click(foodAllergen);

    expect(screen.getByRole('radio', { name: /Beef/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Caffeine/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Chocolate/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Strawberries/i })).toBeInTheDocument();

    const beefAllergen = screen.getByRole('radio', { name: /Beef/i });
    userEvent.click(beefAllergen);
    expect(beefAllergen).toBeChecked();

    // Should display other text box when other allergen is selected
    const otherAllergen = screen.getByRole('radio', { name: /Other/i });
    userEvent.click(otherAllergen);
    expect(otherAllergen).toBeChecked();
    expect(screen.getByRole('textbox', { name: /Please specify other allergen/i })).toBeInTheDocument();
    const otherAllergenTextInput = screen.getByRole('textbox', { name: /Please specify other allergen/i });
    userEvent.type(otherAllergenTextInput, 'Other Allergen Text');

    // should display reaction checkboxes
    expect(screen.getByRole('checkbox', { name: /Anaemia/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Anaphylaxis/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Headache/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Hypertension/i })).toBeInTheDocument();

    // should be able to change patient allergy reaction
    const anaemiaReaction = screen.getByRole('checkbox', { name: /Anaemia/i });
    expect(anaemiaReaction).not.toBeChecked();
    userEvent.click(anaemiaReaction);
    expect(anaemiaReaction).toBeChecked();

    // uncheck selected anaemia reaction
    userEvent.click(anaemiaReaction);
    expect(anaemiaReaction).not.toBeChecked();

    // should display other reaction checkboxes
    const otherReaction = screen.getByRole('checkbox', { name: /Other/i });
    userEvent.click(otherReaction);
    expect(screen.getByLabelText(/Please specify other reaction/)).toBeInTheDocument();
    const otherReactionTextInput = screen.getByLabelText(/Please specify other reaction/);
    userEvent.type(otherReactionTextInput, 'Other Reaction');

    expect(screen.getByRole('radio', { name: /Mild/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Moderate/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Severe/i })).toBeInTheDocument();
    const severeReactionRadio = screen.getByRole('radio', { name: /Severe/i });
    userEvent.click(severeReactionRadio);
    expect(severeReactionRadio).toBeChecked();

    const commentText = screen.getByRole('textbox', { name: /Comments/i });
    userEvent.type(commentText, 'patient test comment');

    const dateOfFirstOnset = screen.getByRole('textbox', { name: /Date of first onset/i });
    fireEvent.change(dateOfFirstOnset, new Date('2021-12-12').toISOString());

    // Save patient allergy
    mockSavePatientAllergy.mockReturnValue(Promise.resolve({ status: 201 }));
    const saveButton = screen.getByRole('button', { name: /Save and Close/i });
    userEvent.click(saveButton);
    expect(mockSavePatientAllergy).toHaveBeenCalledWith(
      {
        allergen: {
          allergenType: 'ENVIRONMENT',
          codedAllergen: { uuid: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
          nonCodedAllergen: 'Other Allergen Text',
        },
        comment: 'patient test comment',
        reactions: [{ reaction: { uuid: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }, reactionNonCoded: 'Other Reaction' }],
        severity: { uuid: '1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      },
      '8673ee4f-e2ab-4077-ba55-4980f408773e',
      expect.anything(),
    );
  });

  it('should display an error when loading the form fails', () => {
    mockConfig.mockReturnValue(mockConcepts);
    mockFetchAllergensAndReaction.mockReturnValue(throwError('loading error'));
    render(
      <AllergyForm
        closeWorkspace={mockCloseWorkspace}
        isTablet={true}
        patient={mockPatient}
        patientUuid={mockPatient.id}
      />,
    );

    expect(screen.getByText(/Allergy Form Error/i)).toBeInTheDocument();
  });

  it('should display error message when error occurs while saving patient allergy', async () => {
    renderAllergyForm();
    const promise = Promise.resolve();
    mockSavePatientAllergy.mockReturnValue(Promise.reject({ status: 500 }));
    const saveButton = screen.getByRole('button', { name: /Save and Close/i });
    userEvent.click(saveButton);
    await waitFor(() =>
      expect(showNotification).toHaveBeenCalledWith({
        critical: true,
        description: undefined,
        kind: 'error',
        title: 'Error saving allergy',
      }),
    );
    await act(() => promise);
  });
});
