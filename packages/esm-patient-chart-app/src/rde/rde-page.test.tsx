import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState, usePatient } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import RdePage from './rde-page.component';

vi.mock('../visit/visits-widget/rde-visit-dashboard.component', () => ({
  default: () => <div>RDE visit dashboard</div>,
}));

const mockUsePatient = vi.mocked(usePatient);
const mockErrorState = vi.mocked(ErrorState);

function renderRdePage() {
  render(
    <MemoryRouter initialEntries={[`/patient/${mockPatient.id}/rde`]}>
      <Routes>
        <Route path="/patient/:patientUuid/rde" element={<RdePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RdePage', () => {
  it('shows a loader while the patient loads', () => {
    mockUsePatient.mockReturnValue({ isLoading: true, patient: null, patientUuid: mockPatient.id, error: null });

    renderRdePage();

    expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('RDE visit dashboard')).not.toBeInTheDocument();
  });

  it('shows an error state, rather than crashing, when the patient fails to load', () => {
    const error = new Error('Not found');
    mockUsePatient.mockReturnValue({ isLoading: false, patient: null, patientUuid: mockPatient.id, error });

    renderRdePage();

    expect(mockErrorState).toHaveBeenCalledWith(expect.objectContaining({ error }), expect.anything());
    expect(screen.queryByText('RDE visit dashboard')).not.toBeInTheDocument();
  });

  it('shows the visit dashboard once the patient has loaded', () => {
    mockUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockPatient,
      patientUuid: mockPatient.id,
      error: null,
    });

    renderRdePage();

    expect(screen.getByRole('tab', { name: 'Visits' })).toBeInTheDocument();
    expect(screen.getByText('RDE visit dashboard')).toBeInTheDocument();
  });
});
