import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';

const mockedUseLayoutType = useLayoutType as jest.Mock;

describe('<ClinicalFormActionButton/>', () => {
  test('should display clinical form action button on tablet view', () => {
    mockedUseLayoutType.mockReturnValue('tablet');

    render(<ClinicalFormActionButton />);

    expect(screen.getByRole('button', { name: /Clinical form/i })).toBeInTheDocument();
  });

  test('should display clinical form action button on desktop view', () => {
    mockedUseLayoutType.mockReturnValue('desktop');

    render(<ClinicalFormActionButton />);

    const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
    expect(clinicalActionButton).not.toHaveTextContent('Clinical form');
  });
});
