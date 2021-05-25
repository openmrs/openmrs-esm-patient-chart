import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Programs from './programs.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';

describe('<ProgramsComponent />', () => {
  it('renders without dying', () => {
    render(
      <BrowserRouter>
        <Programs
          patient={mockPatient}
          patientUuid={mockPatient.id}
          basePath={'patient/8673ee4f-e2ab-4077-ba55-4980f408773e/chart'}
        />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: /Care Programs/i })).toBeInTheDocument();
  });
});
