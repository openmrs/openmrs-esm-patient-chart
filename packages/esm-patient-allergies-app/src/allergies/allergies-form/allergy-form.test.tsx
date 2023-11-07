import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, waitFor, within } from '@testing-library/react';
import { FetchResponse, showNotification, showToast } from '@openmrs/esm-framework';
import { mockAllergens, mockAllergicReactions, mockAllergyResult } from '../../__mocks__/allergies.mock';
import { mockPatient } from '../../../../../tools/test-helpers';
import { NewAllergy, saveAllergy, useAllergens, useAllergicReactions } from './allergy-form.resource';
import AllergyForm from './allergy-form.component';

const mockSaveAllergy = saveAllergy as jest.Mock<Promise<FetchResponse>>;
const mockShowNotification = showNotification as jest.Mock;
const mockShowToast = showToast as jest.Mock;
const mockUseAllergens = useAllergens as jest.Mock;
const mockUseAllergicReactions = useAllergicReactions as jest.Mock;
const mockShowSnackbar = showSnackbar as jest.Mock;
const mockUseAllergensAndAllergicReactions = useAllergensAndAllergicReactions as jest.Mock;

jest.setTimeout(15000);

jest.mock('./allergy-form.resource', () => {
  const originalModule = jest.requireActual('./allergy-form.resource');

  return {
    ...originalModule,
    saveAllergy: jest.fn(() => Promise.resolve({ data: {}, status: 201, statusText: 'Created' })),
    useAllergens: jest.fn(),
    useAllergicReactions: jest.fn(),
  };
});

const mockConcepts = {
  drugAllergenUuid: '162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  environmentalAllergenUuid: '162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  foodAllergenUuid: '162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  mildReactionUuid: '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  moderateReactionUuid: '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  severeReactionUuid: '1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  allergyReactionUuid: '162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  otherConceptUuid: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

mockUseAllergens.mockReturnValue({
  isLoading: false,
  allergens: mockAllergens,
});
mockUseAllergicReactions.mockReturnValue({
  isLoading: false,
  allergicReactions: mockAllergicReactions,
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
    useConfig: jest.fn().mockImplementation(() => ({
      concepts: mockConcepts,
    })),
  };
});

describe('AllergyForm ', () => {
  it('renders the allergy form with all the expected fields and values', async () => {
    renderAllergyForm();

    const allergensContainer = screen.getByTestId('allergens-container');

    expect(screen.getByPlaceholderText(/search allergen/i)).toBeInTheDocument();
    mockAllergens.forEach((allergen) => {
      expect(within(allergensContainer).getByText(allergen.display)).toBeInTheDocument();
    });

    const reactionsContainer = screen.getByTestId('allergic-reactions-container');
    expect(screen.getByText(/select the reactions/i)).toBeInTheDocument();
    mockAllergicReactions.forEach((reaction) => {
      expect(screen.getByRole('checkbox', { name: reaction.display })).toBeInTheDocument();
    });

    expect(screen.getByText(/severity of worst reaction/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /mild/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /moderate/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /severe/i })).toBeInTheDocument();

    expect(screen.getByText(/date of onset and comments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of onset and comments/i)).toBeInTheDocument();
  });

  it('enable the save button when all required fields are filled', async () => {
    renderAllergyForm();
    const user = userEvent.setup();

    const allergen = mockAllergens[0];
    const reaction = mockAllergicReactions[0];

    const saveButton = screen.getByRole('button', { name: /save and close/i });

    expect(saveButton).toBeDisabled();

    await user.click(screen.getByText(allergen.display));
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    expect(saveButton).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: /clear allergen search/i }));
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByText(allergen.display));
    expect(saveButton).toBeEnabled();

    // TODO: Fix O3-2629: changing the allergic reaction won't enable/disable the save button immediately.
  });

  it('calls the saveAllergy function with the correct payload', async () => {
    mockSaveAllergy.mockClear();
    renderAllergyForm();

    const user = userEvent.setup();

    const allergen = mockAllergens[0];
    const reaction = mockAllergicReactions[0];
    const comment = 'some comment';

    await user.click(screen.getByText(allergen.display));
    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    await user.type(screen.getByLabelText(/Date of onset and comments/i), comment);
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    expect(mockSaveAllergy).toHaveBeenCalledTimes(1);

    const expectedPayload: NewAllergy = {
      allergen: {
        allergenType: allergen.type,
        codedAllergen: { uuid: allergen.uuid },
      },
      comment,
      reactions: [{ reaction: { uuid: reaction.uuid } }],
      severity: { uuid: mockConcepts.moderateReactionUuid },
    };

    expect(mockSaveAllergy.mock.calls[0][0]).toEqual(expectedPayload);
  });

  it('renders a success notification after successful submission', async () => {
    mockSaveAllergy.mockClear();
    mockShowToast.mockClear();

    renderAllergyForm();

    const user = userEvent.setup();

    const allergen = mockAllergens[0];
    const reaction = mockAllergicReactions[0];
    const comment = 'some comment';

    await user.click(screen.getByText(allergen.display));
    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    await user.type(screen.getByLabelText(/Date of onset and comments/i), comment);
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Allergy saved',
      subtitle: 'It is now visible on the Allergies page',
    });
  });

  it('renders an error snackbar upon an invalid submission', async () => {
    mockSaveAllergy.mockClear();
    mockShowToast.mockClear();
    mockSaveAllergy.mockRejectedValue({
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    });

    renderAllergyForm();

    const user = userEvent.setup();

    const allergen = mockAllergens[0];
    const reaction = mockAllergicReactions[0];
    const comment = 'some comment';

    await user.click(screen.getByText(allergen.display));
    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    await user.type(screen.getByLabelText(/Date of onset and comments/i), comment);
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
