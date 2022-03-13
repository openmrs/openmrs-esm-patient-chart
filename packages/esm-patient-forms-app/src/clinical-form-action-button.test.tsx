import React from 'react';
import ClinicalFormActionButton from './clinical-form-action-button.component';
import { render, screen } from '@testing-library/react';
import * as mockEsmFramework from '@openmrs/esm-framework';

describe('<ClinicalFormActionButton/>', () => {
  it('should display clinical form action button on tablet view', () => {
    spyOn(mockEsmFramework, 'useLayoutType').and.returnValue('tablet');
    render(<ClinicalFormActionButton />);
    const clinicalActionButton = screen.getByRole('button', { name: /Clinical form/ });

    expect(clinicalActionButton).toBeInTheDocument();
    expect(clinicalActionButton).toHaveClass('container');
  });

  it('should display clinical form action button on tablet view', () => {
    spyOn(mockEsmFramework, 'useLayoutType').and.returnValue('desktop');
    render(<ClinicalFormActionButton />);
    const clinicalActionButton = screen.getByRole('button', { name: /Form/ });

    expect(clinicalActionButton).toBeInTheDocument();
    expect(clinicalActionButton).toHaveClass('container');
  });
});
