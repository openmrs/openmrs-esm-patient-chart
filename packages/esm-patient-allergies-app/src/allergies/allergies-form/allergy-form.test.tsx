import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, within } from '@testing-library/react';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import { mockAllergens, mockAllergicReactions } from '__mocks__';
import { mockPatient } from 'tools';
import {
  type NewAllergy,
  saveAllergy,
  useAllergens,
  useAllergicReactions,
  updatePatientAllergy,
} from './allergy-form.resource';
import AllergyForm from './allergy-form.component';
import { AllergenType, ReactionSeverity } from '../../types';
import { mockAllergy } from '__mocks__';

const mockSaveAllergy = saveAllergy as jest.Mock<Promise<FetchResponse>>;
const mockUseAllergens = useAllergens as jest.Mock;
const mockUseAllergicReactions = useAllergicReactions as jest.Mock;
const mockShowSnackbar = showSnackbar as jest.Mock;
const mockUpdatePatientAllergy = updatePatientAllergy as jest.Mock;

jest.mock('./allergy-form.resource', () => {
  const originalModule = jest.requireActual('./allergy-form.resource');

  return {
    ...originalModule,
    saveAllergy: jest.fn().mockResolvedValue({ data: {}, status: 201, statusText: 'Created' });
    updatePatientAllergy: jest.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'Updated' });
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
    const user = userEvent.setup();

    const allergensContainer = screen.getByTestId('allergens-container');
    const allergenInput = screen.queryByPlaceholderText(/select the allergen/i);

    expect(allergenInput).toBeInTheDocument();
    await user.click(allergenInput);
    mockAllergens.forEach((allergen) => {
      expect(within(allergensContainer).getByText(allergen.display)).toBeInTheDocument();
    });

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
    const allergenInput = screen.getByPlaceholderText(/select the allergen/i);

    expect(saveButton).toBeDisabled();

    await user.click(allergenInput);
    await user.click(screen.getByText(allergen.display));
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    expect(saveButton).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /Clear selected item/i }));
    expect(saveButton).toBeDisabled();

    await user.click(allergenInput);
    await user.click(screen.getByText(allergen.display));
    expect(saveButton).toBeEnabled();

    // TODO: Fix O3-2629: changing the allergic reaction won't enable/disable the save button immediately.
  });

  it('calls the saveAllergy function with the correct payload', async () => {
    mockSaveAllergy.mockClear();
    renderAllergyForm();

    const user = userEvent.setup();
    const allergenInput = screen.getByPlaceholderText(/select the allergen/i);

    const allergen = mockAllergens[0];
    const reaction = mockAllergicReactions[0];
    const comment = 'some comment';

    await user.click(allergenInput);
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

  it('displays a custom input and a warning message when select other allergen', async () => {
    renderAllergyForm();

    const user = userEvent.setup();
    const allergenInput = screen.getByPlaceholderText(/select the allergen/i);
    const allergensContainer = screen.getByTestId('allergens-container');

    await user.click(allergenInput);
    await user.click(within(allergensContainer).getByText(/other/i));

    const otherInput = screen.queryByLabelText(/Other non-coded allergen/i);
    expect(otherInput).toBeInTheDocument();

    const warningMessage = screen.queryByText(
      "Adding a custom allergen may impact system-wide allergy notifications. It's recommended to choose from the provided list for accurate alerts. Custom entries may not trigger notifications in all relevant contexts.",
    );
    expect(warningMessage).toBeInTheDocument();
  });

  it('calls the saveAllergy function with the correct payload when select other allergen', async () => {
    mockSaveAllergy.mockClear();
    renderAllergyForm();

    const user = userEvent.setup();
    const allergenInput = screen.getByPlaceholderText(/select the allergen/i);
    const allergensContainer = screen.getByTestId('allergens-container');
    const customAllergen = 'some other allergen';
    const reaction = mockAllergicReactions[0];
    const comment = 'some comment';

    await user.click(allergenInput);
    await user.click(within(allergensContainer).getByText(/other/i));

    const customAllergenInput = screen.getByLabelText(/Other non-coded allergen/i);

    await user.type(customAllergenInput, customAllergen);
    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    await user.type(screen.getByLabelText(/Date of onset and comments/i), comment);
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    expect(mockSaveAllergy).toHaveBeenCalledTimes(1);
    const expectedPayload: NewAllergy = {
      allergen: {
        allergenType: AllergenType.OTHER,
        codedAllergen: { uuid: mockConcepts.otherConceptUuid },
        nonCodedAllergen: customAllergen,
      },
      comment,
      reactions: [{ reaction: { uuid: reaction.uuid } }],
      severity: { uuid: mockConcepts.moderateReactionUuid },
    };

    expect(mockSaveAllergy.mock.calls[0][0]).toEqual(expectedPayload);
  });

  it('renders a success notification after successful submission', async () => {
    mockSaveAllergy.mockClear();
    mockShowSnackbar.mockClear();

    renderAllergyForm();

    const user = userEvent.setup();
    const allergenInput = screen.getByPlaceholderText(/select the allergen/i);

    const allergen = mockAllergens[0];
    const reaction = mockAllergicReactions[0];
    const comment = 'some comment';

    await user.click(allergenInput);
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
    mockShowSnackbar.mockClear();
    mockSaveAllergy.mockRejectedValue({
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    });

    renderAllergyForm();

    const user = userEvent.setup();
    const allergenInput = screen.getByPlaceholderText(/select the allergen/i);

    const allergen = mockAllergens[0];
    const reaction = mockAllergicReactions[0];
    const comment = 'some comment';

    await user.click(allergenInput);
    await user.click(screen.getByText(allergen.display));
    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    await user.type(screen.getByLabelText(/Date of onset and comments/i), comment);
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      title: 'Error saving allergy',
      subtitle: 'Internal Server Error',
      kind: 'error',
    });
  });
  it('Edit Allergy should call the saveAllergy function with updated payload', async () => {
    mockSaveAllergy.mockClear();
    renderEditAllergyForm();

    const user = userEvent.setup();
    const allergenInput = screen.getByPlaceholderText(/select the allergen/i);
    const commentInput = screen.getByLabelText(/Date of onset and comments/i);

    const allergen = mockAllergens[2];
    const reaction = mockAllergicReactions[0];
    const comment = 'new comment';

    await user.click(allergenInput);
    await user.click(screen.getByText(allergen.display));
    await user.click(screen.getByRole('checkbox', { name: reaction.display }));
    await user.click(screen.getByRole('radio', { name: /moderate/i }));
    await user.clear(commentInput);
    await user.type(commentInput, comment);
    await user.click(screen.getByRole('button', { name: /save and close/i }));

    expect(mockUpdatePatientAllergy).toHaveBeenCalledTimes(1);

    const expectedPayload: NewAllergy = {
      allergen: {
        allergenType: allergen.type,
        codedAllergen: { uuid: allergen.uuid },
      },
      comment,
      reactions: [
        { reaction: { uuid: reaction.uuid } },
        { reaction: { uuid: mockAllergicReactions[2].uuid } },
        { reaction: { uuid: mockAllergicReactions[3].uuid } },
      ],
      severity: { uuid: mockConcepts.moderateReactionUuid },
    };

    expect(mockUpdatePatientAllergy.mock.calls[0][0]).toEqual(expectedPayload);
    expect(mockAllergy).not.toEqual(expectedPayload);
  });
});

function renderAllergyForm() {
  const testProps = {
    closeWorkspace: () => {},
    closeWorkspaceWithSavedChanges: () => {},
    promptBeforeClosing: () => {},
    allergy: null,
    formContext: 'creating' as 'creating' | 'editing',
    patient: mockPatient,
    patientUuid: mockPatient.id,
  };

  render(<AllergyForm {...testProps} />);
}

function renderEditAllergyForm() {
  const testProps = {
    closeWorkspace: () => {},
    closeWorkspaceWithSavedChanges: () => {},
    promptBeforeClosing: () => {},
    allergy: mockAllergy,
    formContext: 'editing' as 'creating' | 'editing',
    patient: mockPatient,
    patientUuid: mockPatient.id,
  };

  render(<AllergyForm {...testProps} />);
}
