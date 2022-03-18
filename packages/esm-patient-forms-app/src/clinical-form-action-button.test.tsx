import React from 'react';
import ClinicalFormActionButton from './clinical-form-action-button.component';
import { render, screen } from '@testing-library/react';
import * as mockEsmFramework from '@openmrs/esm-framework/mock';

describe('<ClinicalFormActionButton/>', () => {
  test('should display clinical form action button on tablet view', () => {
    spyOn(mockEsmFramework, 'useLayoutType').and.returnValue('tablet');
    render(<ClinicalFormActionButton />);
    expect(screen.getByRole('button', { name: /Clinical form/ })).toBeInTheDocument();
  });

  test('should display clinical form action button on desktop view', () => {
    spyOn(mockEsmFramework, 'useLayoutType').and.returnValue('desktop');
    render(<ClinicalFormActionButton />);
    const clinicalActionButton = screen.getByRole('button', { name: /Form/ });
    expect(clinicalActionButton).not.toHaveTextContent('Clinical form');
  });
});
