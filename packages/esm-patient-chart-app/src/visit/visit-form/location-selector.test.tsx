import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  getDefaultsFromConfigSchema,
  useConfig,
  useLocations,
  useSession,
  useFeatureFlag,
} from '@openmrs/esm-framework';
import { esmPatientChartSchema, type ChartConfig } from '../../config-schema';
import { mockLocationsResponse, mockSessionDataResponse } from '__mocks__';
import { type VisitFormData } from './visit-form.resource';
import { useDefaultFacilityLocation } from '../hooks/useDefaultFacilityLocation';
import LocationSelector from './location-selector.component';

const mockSession = jest.mocked(useSession);
const mockUseLocations = jest.mocked(useLocations);
const mockUseConfig = jest.mocked(useConfig<ChartConfig>);
const mockUseFeatureFlag = jest.mocked(useFeatureFlag);
const mockUseDefaultFacilityLocation = jest.mocked(useDefaultFacilityLocation);

mockSession.mockReturnValue(mockSessionDataResponse.data);

beforeEach(() => {
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(esmPatientChartSchema),
  });
  mockUseFeatureFlag.mockReturnValue(true);
});

describe('LocationSelector', () => {
  it('should render a paragraph with the default visit location when disableChangingVisitLocation is truthy', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      disableChangingVisitLocation: true,
    });

    renderLocationSelector();

    expect(screen.getByText(/visit location/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('paragraph')).toHaveTextContent('Inpatient Ward');
  });

  it('should render a list of locations to pick from if disableChangingVisitLocation is falsy', () => {
    renderLocationSelector();

    expect(screen.getByRole('combobox', { name: /select a location/i })).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('should display session location as the selected location when no locations are available', () => {
    mockUseLocations.mockReturnValue([]);

    renderLocationSelector();

    expect(screen.getByRole('combobox')).toHaveValue('Test Location');
  });

  it('should render a list of locations to pick from if locations are available from the backend', async () => {
    const user = userEvent.setup();
    mockUseLocations.mockReturnValue(mockLocationsResponse);

    renderLocationSelector();

    const locationSelector = screen.getByRole('combobox');
    expect(locationSelector).toBeInTheDocument();

    await user.click(locationSelector);

    mockLocationsResponse.forEach((location) => {
      expect(screen.getByRole('option', { name: location.display })).toBeInTheDocument();
    });
  });

  it('should call useLocations with Visit Location restriction when restrictByVisitLocationTag is true and the EMR API module is installed', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      restrictByVisitLocationTag: true,
    });
    mockUseFeatureFlag.mockReturnValue(true);

    renderLocationSelector();

    expect(mockUseLocations).toHaveBeenCalledWith('Visit Location', '');
  });

  it('should not restrict locations by the Visit Location tag when the EMR API module is not installed', () => {
    const consoleError = jest.spyOn(console, 'warn').mockImplementation(() => {});

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientChartSchema),
      restrictByVisitLocationTag: true,
    });
    mockUseFeatureFlag.mockReturnValue(false);

    renderLocationSelector();

    expect(mockUseLocations).toHaveBeenCalledWith(null, '');
    consoleError.mockRestore();
  });

  it('should update the search term incrementally as user types in the combobox', async () => {
    const user = userEvent.setup();
    mockUseLocations.mockReturnValue(mockLocationsResponse);

    renderLocationSelector();

    const locationSelector = screen.getByRole('combobox');
    await user.click(locationSelector);
    await user.clear(locationSelector);
    await user.paste('test search');

    expect(mockUseLocations).toHaveBeenCalledWith(null, 'test search');
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
