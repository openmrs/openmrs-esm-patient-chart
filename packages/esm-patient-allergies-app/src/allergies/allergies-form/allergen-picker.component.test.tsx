import React from 'react';
import { render, screen } from '@testing-library/react';
import AllergenPicker from './allergen-picker.component';
import { AllergenType } from '../../types';
import { type Allergen } from './allergy-form.resource';
import userEvent from '@testing-library/user-event';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useConfig: jest.fn(() => {
      return {
        concepts: {
          otherConceptUuid: 'some-uuid',
        },
      };
    }),
  };
});

const allergens: Allergen[] = [
  {
    uuid: 'some-uuid',
    display: 'Strawberries',
    type: AllergenType.FOOD,
  },
  {
    uuid: 'some-uuid2',
    display: 'Blueberries',
    type: AllergenType.FOOD,
  },
  {
    uuid: 'some-uuid3',
    display: 'Aspirin',
    type: AllergenType.DRUG,
  },
];

describe('Allergen Picker', () => {
  it('renders the allergen picker with all the expected fields and values', async () => {
    render(<AllergenPicker allergens={allergens} onAllergenChange={jest.fn()} selectedAllergen={null} />);
    expect(screen.getByPlaceholderText(/search allergen/i)).toBeInTheDocument();

    allergens.forEach((allergen) => {
      expect(screen.getByText(allergen.display)).toBeInTheDocument();
    });
    expect(screen.getByText(/other/i)).toBeInTheDocument();
  });

  it('renders the allergen picker with the selected allergen', async () => {
    const selectedAllergen = allergens[0];
    render(<AllergenPicker allergens={allergens} onAllergenChange={jest.fn()} selectedAllergen={selectedAllergen} />);

    const allergenList = screen.queryByRole('menu');

    expect(screen.getByPlaceholderText(/search allergen/i)).toHaveValue(selectedAllergen.display);
    expect(allergenList).not.toBeInTheDocument();
  });

  it('should filter allergens by keyword', async () => {
    render(<AllergenPicker allergens={allergens} onAllergenChange={jest.fn()} selectedAllergen={null} />);
    const allergenSearch = screen.getByPlaceholderText(/search allergen/i);

    // filter by keyword
    await userEvent.type(allergenSearch, 'berries');
    expect(screen.getByText('Strawberries')).toBeInTheDocument();
    expect(screen.queryByText('Blueberries')).toBeInTheDocument();
    expect(screen.queryByText('Aspirin')).not.toBeInTheDocument();
  });

  it('should always display other allergen along with the filtered allergens', async () => {
    render(<AllergenPicker allergens={allergens} onAllergenChange={jest.fn()} selectedAllergen={null} />);
    const allergenSearch = screen.getByPlaceholderText(/search allergen/i);

    // filter by keyword
    await userEvent.type(allergenSearch, 'berries');
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should call onAllergenChange when an allergen is selected', async () => {
    const onAllergenChange = jest.fn();
    render(<AllergenPicker allergens={allergens} onAllergenChange={onAllergenChange} selectedAllergen={null} />);
    const allergenSearch = screen.getByPlaceholderText(/search allergen/i);

    await userEvent.click(screen.getByText(allergens[0].display));
    expect(onAllergenChange).toHaveBeenCalledWith(allergens[0]);
  });

  it('should clear the selected allergen when the search field is cleared', async () => {
    const onAllergenChange = jest.fn();
    render(
      <AllergenPicker allergens={allergens} onAllergenChange={onAllergenChange} selectedAllergen={allergens[0]} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /clear allergen search/i }));
    expect(onAllergenChange).toHaveBeenCalledWith(null);
  });
});
