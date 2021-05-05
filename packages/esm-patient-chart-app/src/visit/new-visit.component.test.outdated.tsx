import React from 'react';
import dayjs from 'dayjs';
import { render, screen, fireEvent } from '@testing-library/react';
import { of } from 'rxjs/internal/observable/of';
import { mockVisitTypesDataResponse } from '../../../../__mocks__/visits.mock';
import { mockLocationsDataResponse } from '../../../../__mocks__/location.mock';
import { mockSessionDataResponse } from '../../../../__mocks__/session.mock';
import { openmrsObservableFetch } from '@openmrs/esm-framework';
import NewVisit from './new-visit.component';

const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

mockOpenmrsObservableFetch.mockImplementation(jest.fn());

describe('<NewVisit />', () => {
  let patientUuid = 'some-patient-uuid';

  afterEach(mockOpenmrsObservableFetch.mockReset);
  beforeEach(() => {
    mockOpenmrsObservableFetch.mockImplementation((url: string, config: { method: string; body: any }) => {
      if (url.indexOf('/visittype') >= 0) {
        return of(mockVisitTypesDataResponse);
      }
      if (url.indexOf('/location') >= 0) {
        return of(mockLocationsDataResponse);
      }
      if (url.indexOf('/session') >= 0) {
        return of(mockSessionDataResponse);
      }
      if (url.indexOf('/visit') >= 0 && config.method === 'POST') {
        return of({ data: config.body });
      }
      // return nothing to ensure that all api calls are mocked
    });
  });

  it('renders and default values are selected', () => {
    render(<NewVisit onVisitStarted={() => {}} onCanceled={() => {}} closeComponent={() => {}} viewMode={true} />);
    expect(screen.getByRole('heading', { name: 'Start new visit' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Type of visit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Outpatient Visit' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'HIV Return Visit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    // check for default selected location being the session location
    expect(screen.getByDisplayValue(/Inpatient Ward/i)).toBeInTheDocument();
  });

  it('starts or cancels a new visit', async () => {
    const mockStartedCallback = jest.fn();
    const mockCancelledCallback = jest.fn();
    const mockCloseComponent = jest.fn();

    render(
      <NewVisit
        onVisitStarted={mockStartedCallback}
        onCanceled={mockCancelledCallback}
        closeComponent={mockCloseComponent}
        viewMode={true}
      />,
    );

    const testDate = dayjs(new Date()).subtract(1, 'day').subtract(1, 'hour').set('second', 0).set('millisecond', 0);

    // simulate visit type selection
    const visitTypeSelect = screen.getByLabelText(/Type of visit/i);
    fireEvent.change(visitTypeSelect, { target: { value: 'some-uuid1' } });

    // simulate location selection
    const locationSelect = screen.getByLabelText(/location/i);
    fireEvent.change(locationSelect, { target: { value: 'some-uuid1' } });

    // simulate date selection
    const dateControl = screen.getByLabelText('Start date');
    fireEvent.change(dateControl, {
      target: { value: testDate.format('YYYY-MM-DD') },
    });

    const timeControl = screen.getByLabelText('Start time');
    fireEvent.change(timeControl, {
      target: { value: testDate.format('HH:mm') },
    });

    // simulate clicking of save
    const saveButton = await screen.findByText('Start');
    fireEvent(
      saveButton,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(mockStartedCallback.mock.calls.length).toBe(1);
    expect(mockStartedCallback.mock.calls[0][0]).toBeTruthy();
    expect(mockStartedCallback.mock.calls[0][0]['visitType']).toEqual('some-uuid1');
    expect(mockStartedCallback.mock.calls[0][0]['location']).toEqual('some-uuid1');
    expect(mockStartedCallback.mock.calls[0][0]['patient']).toEqual(patientUuid);
    expect(dayjs(mockStartedCallback.mock.calls[0][0]['startDatetime']).isSame(testDate)).toBe(true);

    // simulate cancelling
    const cancelButton = await screen.getByRole('button', { name: 'Cancel' });
    fireEvent(
      cancelButton,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(mockCancelledCallback.mock.calls.length).toBe(1);
  });
});
