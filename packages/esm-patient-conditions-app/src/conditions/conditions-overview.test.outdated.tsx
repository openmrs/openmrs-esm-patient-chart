import React from 'react';
import dayjs from 'dayjs';
import ConditionsOverview from './conditions-overview.component';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { of } from 'rxjs/internal/observable/of';
import { performPatientConditionsSearch } from './conditions.resource';
import { mockPatientConditionsResult } from '../../../../__mocks__/conditions.mock';

const mockPerformPatientConditionsSearch = performPatientConditionsSearch as jest.Mock;

const renderConditionsOverview = () => {
  render(
    <BrowserRouter>
      <ConditionsOverview basePath="/" />
    </BrowserRouter>,
  );
};

jest.mock('./conditions.resource', () => ({
  performPatientConditionsSearch: jest.fn(),
}));

const renderDateDisplay = (time: string) => dayjs(time).format('MMM-YYYY');

describe('<ConditionsOverview />', () => {
  it('should display the patient conditions', async () => {
    mockPerformPatientConditionsSearch.mockReturnValue(of(mockPatientConditionsResult));

    renderConditionsOverview();

    await screen.findByText('Conditions');

    expect(screen.getByText('Conditions')).toBeInTheDocument();
    expect(screen.getByText('Active Conditions')).toBeInTheDocument();
    expect(screen.getByText('Since')).toBeInTheDocument();
    expect(screen.getByText('Malaria, confirmed')).toBeInTheDocument();
    expect(screen.getByText(renderDateDisplay(mockPatientConditionsResult[0].onsetDateTime))).toBeInTheDocument();
    expect(screen.getByText('Anaemia')).toBeInTheDocument();
    expect(screen.getByText(renderDateDisplay(mockPatientConditionsResult[1].onsetDateTime))).toBeInTheDocument();
    expect(screen.getByText('Anosmia')).toBeInTheDocument();
    expect(screen.getByText(renderDateDisplay(mockPatientConditionsResult[2].onsetDateTime))).toBeInTheDocument();
    expect(screen.getByText(/Generalized skin infection due to AIDS/i)).toBeInTheDocument();
  });

  it('renders an empty state view when conditions data is absent', async () => {
    mockPerformPatientConditionsSearch.mockReturnValue(of([]));

    renderConditionsOverview();
    await screen.findByText('Conditions');
    expect(screen.getByText('Conditions')).toBeInTheDocument();
    expect(screen.getByText(/There are no conditions to display for this patient/)).toBeInTheDocument();
  });
});
