import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import FormsDashboard from './forms-dashboard.component';

const mockedUseLayoutType = useLayoutType as jest.Mock;

describe('<ClinicalFormActionButton/>', () => {
  test('should display clinical form action button on tablet view', () => {
    mockedUseLayoutType.mockReturnValue('tablet');

    renderFormsDashboard();

    expect(screen.getByRole('button', { name: /Clinical form/i })).toBeInTheDocument();
  });

  test('should display clinical form action button on desktop view', () => {
    mockedUseLayoutType.mockReturnValue('desktop');

    renderFormsDashboard();

    const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
    expect(clinicalActionButton).not.toHaveTextContent('Clinical form');
  });
});

function renderFormsDashboard(){
  const props = {
    patientUuid: 'patientUuid',
    patient: { id: 'patientUuid' },
    isOffline: false,
  }
  render <FormsDashboard {...props}/>
}
