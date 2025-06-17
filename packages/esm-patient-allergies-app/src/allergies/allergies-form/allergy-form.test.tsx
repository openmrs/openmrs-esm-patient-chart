import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { getDefaultsFromConfigSchema, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { mockAllergens, mockAllergicReactions, mockAllergy } from '__mocks__';
import { mockPatient } from 'tools';
import {
  type NewAllergy,
  saveAllergy,
  useAllergens,
  useAllergicReactions,
  updatePatientAllergy,
} from './allergy-form.resource';
import { type AllergiesConfigObject, configSchema } from '../../config-schema';
import AllergyForm from './allergy-form.workspace';

const mockSaveAllergy = jest.mocked(saveAllergy);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUpdatePatientAllergy = jest.mocked(updatePatientAllergy);
const mockUseAllergens = jest.mocked(useAllergens);
const mockUseAllergicReactions = jest.mocked(useAllergicReactions);
const mockUseConfig = jest.mocked(useConfig<AllergiesConfigObject>);

jest.mock('./allergy-form.resource', () => ({
  ...jest.requireActual('./allergy-form.resource'),
  saveAllergy: jest.fn().mockResolvedValue({ data: {}, status: 201, statusText: 'Created' }),
  updatePatientAllergy: jest.fn().mockResolvedValue({ data: {}, status: 200, statusText: 'Updated' }),
  useAllergens: jest.fn(),
  useAllergicReactions: jest.fn(),
}));

const mockConcepts = {
  allergyReactionUuid: '162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  drugAllergenUuid: '162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  environmentalAllergenUuid: '162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  foodAllergenUuid: '162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  mildReactionUuid: '1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  moderateReactionUuid: '1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  otherConceptUuid: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  severeReactionUuid: '1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

describe('AllergyForm', () => {
  beforeEach(() => {
    mockUseAllergens.mockReturnValue({
      isLoading: false,
      allergens: mockAllergens,
    });
    mockUseAllergicReactions.mockReturnValue({
      isLoading: false,
      allergicReactions: mockAllergicReactions,
    });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      concepts: mockConcepts,
    });
  });

  describe('Creating a new allergy', () => {
    const user = userEvent.setup();

    const aceInhibitorsAllergen = mockAllergens.find((allergen) => allergen.display === 'ACE inhibitors');
    const reactionToAceInhibitors = mockAllergicReactions.find((reaction) => reaction.display === 'Cough')?.display;

    it('creates a new allergy when the user selects an allergen and reaction', async () => {
      renderAllergyForm();

      await user.click(screen.getByRole('combobox', { name: /allergen/i }));
      await user.click(screen.getByText(aceInhibitorsAllergen.display));
      await user.click(screen.getByRole('checkbox', { name: reactionToAceInhibitors }));
      await user.click(screen.getByRole('radio', { name: /moderate/i }));
      await user.type(
        screen.getByLabelText(/comments/i),
        'Patient experienced a persistent dry cough while taking ACE inhibitors, which resolved upon discontinuation and recurred upon rechallenge',
      );
      await user.click(screen.getByRole('button', { name: /save and close/i }));

      expect(mockSaveAllergy).toHaveBeenCalledTimes(1);
      expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        isLowContrast: true,
        kind: 'success',
        title: 'Allergy saved',
        subtitle: 'It is now visible on the Allergies page',
      });
    });

    it('validates required fields before saving', async () => {
      renderAllergyForm();

      // Test initial validation
      await user.click(screen.getByRole('button', { name: /save and close/i }));

      // Test all required field validations
      expect(mockSaveAllergy).not.toHaveBeenCalled();
      expect(screen.getByText(/allergen is required/i)).toBeInTheDocument();
      expect(screen.getByText(/at least one reaction is required/i)).toBeInTheDocument();
      expect(screen.getByText(/severity is required/i)).toBeInTheDocument();

      // Test allergen validation
      await user.click(screen.getByRole('combobox', { name: /allergen/i }));
      await user.click(screen.getByText(aceInhibitorsAllergen.display));
      expect(screen.queryByText(/allergen is required/i)).not.toBeInTheDocument();

      // Test "other" allergen validation
      await user.click(screen.getByRole('combobox', { name: /allergen/i }));
      await user.click(screen.getAllByText('Other')[0]);

      const warningMessage = screen.queryByText(
        "Adding a custom allergen may impact system-wide allergy notifications. It's recommended to choose from the provided list for accurate alerts. Custom entries may not trigger notifications in all relevant contexts.",
      );
      expect(warningMessage).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /save and close/i }));
      expect(screen.getByText(/please specify the non-coded allergen/i)).toBeInTheDocument();

      // Test reaction validation
      await user.click(screen.getByRole('checkbox', { name: reactionToAceInhibitors }));
      expect(screen.queryByText(/at least one reaction is required/i)).not.toBeInTheDocument();

      // Test "other" reaction validation
      await user.click(screen.getByRole('checkbox', { name: /other/i }));
      await user.click(screen.getByRole('button', { name: /save and close/i }));
      expect(screen.getByText(/please specify the non-coded allergic reaction/i)).toBeInTheDocument();

      // Test severity validation
      await user.click(screen.getByRole('radio', { name: /moderate/i }));
      expect(screen.queryByText(/severity is required/i)).not.toBeInTheDocument();
    });

    it('handles submission errors gracefully', async () => {
      mockSaveAllergy.mockRejectedValue({
        message: 'Internal Server Error',
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      });

      renderAllergyForm();

      await user.click(screen.getByRole('combobox', { name: /allergen/i }));
      await user.click(screen.getByText(aceInhibitorsAllergen.display));
      await user.click(screen.getByRole('checkbox', { name: reactionToAceInhibitors }));
      await user.click(screen.getByRole('radio', { name: /moderate/i }));
      await user.type(screen.getByLabelText(/comments/i), 'Test comment');

      await user.click(screen.getByRole('button', { name: /save and close/i }));

      expect(mockSaveAllergy).toHaveBeenCalledTimes(1);
      expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        isLowContrast: false,
        title: 'Error saving allergy',
        subtitle: 'Internal Server Error',
        kind: 'error',
      });
    });
  });

  describe('Editing an existing allergy', () => {
    const user = userEvent.setup();

    it('should call the saveAllergy function with updated payload', async () => {
      renderAllergyForm({ allergy: mockAllergy, formContext: 'editing' });

      const aceInhibitorsAllergen = mockAllergens.find((allergen) => allergen.display === 'ACE inhibitors');
      const rashReaction = mockAllergicReactions.find((reaction) => reaction.display === 'Rash');

      // Clear existing reactions first
      const existingReactions = screen.getAllByRole('checkbox', { checked: true });
      for (const reaction of existingReactions) {
        await user.click(reaction);
      }

      await user.click(screen.getByRole('checkbox', { name: rashReaction.display }));
      await user.click(screen.getByRole('radio', { name: /moderate/i }));
      await user.clear(screen.getByLabelText(/comments/i));
      await user.type(
        screen.getByLabelText(/comments/i),
        'Patient developed a rash after taking aspirin. The rash resolved after discontinuing the medication.',
      );
      await user.click(screen.getByRole('button', { name: /save and close/i }));

      expect(mockUpdatePatientAllergy).toHaveBeenCalledTimes(1);

      const expectedPayload: NewAllergy = buildExpectedPayload(
        aceInhibitorsAllergen,
        rashReaction,
        mockConcepts.moderateReactionUuid,
        'Patient developed a rash after taking aspirin. The rash resolved after discontinuing the medication.',
      );

      expect(mockUpdatePatientAllergy.mock.calls[0][0]).toEqual(expectedPayload);
      expect(mockAllergy).not.toEqual(expectedPayload);
    });
  });
});

function renderAllergyForm(props = {}) {
  const defaultProps = {
    allergy: null,
    closeWorkspace: () => {},
    closeWorkspaceWithSavedChanges: () => {},
    formContext: 'creating' as 'creating' | 'editing',
    patient: mockPatient,
    patientUuid: mockPatient.id,
    promptBeforeClosing: () => {},
    setTitle: jest.fn(),
  };

  render(<AllergyForm {...defaultProps} {...props} />);
}

function buildExpectedPayload(allergen, reaction, severity, comment) {
  return {
    allergen: {
      allergenType: allergen.type,
      codedAllergen: { uuid: allergen.uuid },
    },
    comment,
    reactions: [{ reaction: { uuid: reaction.uuid } }],
    severity: { uuid: severity },
  };
}
