import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import { swrRender, waitForLoadingToFinish } from '../../../../../tools/test-helpers';
import { visitOverviewDetailMockData } from '../../../../../__mocks__/visits.mock';
import { mockPatient } from '../../../../../__mocks__/patient.mock';
import VisitDetailOverview from './visit-detail-overview.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    getVisitsForPatient: jest.fn(),
    createErrorHandler: jest.fn(),
    useLayoutType: jest.fn(),
    ExtensionSlot: jest.fn().mockImplementation((ext) => ext.slotName),
  };
});

describe('VisitDetailOverview', () => {
  it('renders an empty state view if encounters data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderVisitDetailOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /Encounters/i })).toBeInTheDocument();
    expect(screen.getByTitle(/Empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no encounters to display for this patient/i)).toBeInTheDocument();
  });

  it('renders an error state view if there was a problem fetching encounters data', async () => {
    const error = {
      message: 'Unauthorized',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderVisitDetailOverview();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /encounters/i })).toBeInTheDocument();
    expect(screen.getByText(/Error 401: Unauthorized/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the visit detail overview component', async () => {
    mockOpenmrsFetch.mockReturnValueOnce(visitOverviewDetailMockData);

    renderVisitDetailOverview();

    await waitForLoadingToFinish();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ECH Aug 18, 2021/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All encounters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Visit summary/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Vitals/i })).toBeInTheDocument();

    const tableHeaders = [/Time/i, /Encounter type/i, /Provider/i];
    tableHeaders.forEach((header) => expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument());

    const visitSummaryButton = screen.getByRole('button', { name: /Expand current row/i });
    userEvent.click(visitSummaryButton);

    expect(screen.getByRole('button', { name: /Collapse current row/i })).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /Pulse: 140.0 Arterial blood oxygen saturation \(pulse oximeter\): 89.0 Respiratory rate: 35.0 Systolic: 80.0 Diastolic: 30.0 Temperature \(C\): 40.0 General patient note: Looks very unwell/i,
      }),
    ).toBeInTheDocument();
  });
});

function renderVisitDetailOverview() {
  swrRender(<VisitDetailOverview {...testProps} />);
}
