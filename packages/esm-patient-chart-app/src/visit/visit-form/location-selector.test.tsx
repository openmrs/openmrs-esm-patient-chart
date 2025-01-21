import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { getDefaultsFromConfigSchema, useConfig, useLocations, useSession } from '@openmrs/esm-framework';
import { esmPatientChartSchema, type ChartConfig } from '../../config-schema';
import { mockLocationsResponse, mockSessionDataResponse } from '__mocks__';
import { type VisitFormData } from './visit-form.resource';
import LocationSelector from './location-selector.component';

const mockSession = jest.mocked(useSession);
const mockUseLocations = jest.mocked(useLocations);
const mockUseConfig = jest.mocked(useConfig<ChartConfig>);

mockSession.mockReturnValue(mockSessionDataResponse.data);

beforeEach(() => {
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(esmPatientChartSchema),
  });
});

describe('tests location selector', () => {
  it('renders a paragraph with the location name if disableChangingVisitLocation is truthy', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      disableChangingVisitLocation: true,
    });

    renderLocationSelector();

    expect(screen.getByText(/visit location/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('paragraph')).toHaveTextContent('Inpatient Ward');
  });

  it('renders a combobox with options to pick from if disableChangingVisitLocation is falsy', () => {
    renderLocationSelector();

    expect(screen.getByRole('combobox', { name: /select a location/i })).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('defaults to showing the session location as the selected location if no locations are available', () => {
    mockUseLocations.mockReturnValue([]);

    renderLocationSelector();

    expect(screen.getByRole('combobox')).toHaveValue('Test Location');
  });

  it('renders a list of locations to pick from if locations are available', async () => {
    const user = userEvent.setup();

    mockUseLocations.mockReturnValue(mockLocationsResponse);

    renderLocationSelector();
    expect(mockUseLocations).toHaveBeenCalledWith(null, '');
    expect(mockUseLocations).toHaveBeenCalledWith(null, 'Test Location');

    const locationSelector = screen.getByRole('combobox');
    expect(locationSelector).toBeInTheDocument();

    await user.click(locationSelector);

    mockLocationsResponse.forEach((location) => {
      expect(screen.getByRole('option', { name: location.display })).toBeInTheDocument();
    });
  });

  it('should call use locations with Visit Location restriction when restrictByVisitLocationTag set true ', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      restrictByVisitLocationTag: true,
    });

    const user = userEvent.setup();

    mockUseLocations.mockReturnValue(mockLocationsResponse);

    renderLocationSelector();
    expect(mockUseLocations).toHaveBeenCalledWith('Visit Location', '');
    expect(mockUseLocations).toHaveBeenCalledWith('Visit Location', 'Test Location');
  });
});

function renderLocationSelector(props = {}) {
  const visitToEdit = {
    uuid: 'visit-uuid',
    location: {
      uuid: 'test-location-uuid',
      display: 'Test Location',
    },
  };

  const App = () => {
    const methods = useForm<VisitFormData>({
      mode: 'all',
      defaultValues: {
        visitLocation: visitToEdit?.location ?? mockSessionDataResponse.data.sessionLocation ?? {},
      },
    });

    return (
      <FormProvider {...methods}>
        <LocationSelector control={methods.control} />
      </FormProvider>
    );
  };

  render(<App />);
}
