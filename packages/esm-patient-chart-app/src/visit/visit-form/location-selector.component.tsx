import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { ComboBox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Control, Controller } from 'react-hook-form';
import {
  type Location,
  type OpenmrsResource,
  useConfig,
  useSession,
  useLocations,
  useFeatureFlag,
} from '@openmrs/esm-framework';
import { type VisitFormData } from './visit-form.resource';
import { useDefaultFacilityLocation } from '../hooks/useDefaultFacilityLocation';
import { type ChartConfig } from '../../config-schema';
import styles from './visit-form.scss';
import { useDefaultVisitLocation } from '../hooks/useDefaultVisitLocation';

interface LocationSelectorProps {
  control: Control<VisitFormData>;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ control }) => {
  const { t } = useTranslation();
  const config = useConfig<ChartConfig>();
  const [searchTerm, setSearchTerm] = useState('');
  const sessionLocation = useSession().sessionLocation;
  const isEmrApiModuleInstalled = useFeatureFlag('emrapi-module');
  const defaultVisitLocation = useDefaultVisitLocation(
    sessionLocation,
    config.restrictByVisitLocationTag && isEmrApiModuleInstalled,
  );
  const locations = useLocations(
    config.restrictByVisitLocationTag && isEmrApiModuleInstalled ? 'Visit Location' : null,
    searchTerm,
  );
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultFacilityLocation();
  const disableChangingVisitLocation = config?.disableChangingVisitLocation;
  const locationsToShow: Array<OpenmrsResource> =
    !loadingDefaultFacility && !isEmpty(defaultFacility) ? [defaultFacility] : locations ? locations : [];

  const handleSearch = (searchString) => {
    setSearchTerm(searchString);
  };

  useEffect(() => {
    if (config.restrictByVisitLocationTag && !isEmrApiModuleInstalled) {
      console.warn('EMR API module is not installed. Visit location will not be restricted by location tag.');
    }
  }, [config.restrictByVisitLocationTag, isEmrApiModuleInstalled]);

  return (
    <section data-testid="combo">
      <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
      <div className={classNames(styles.selectContainer, styles.sectionField)}>
        {!disableChangingVisitLocation ? (
          <Controller
            control={control}
            name="visitLocation"
            render={({ field: { onBlur, onChange, value } }) => (
              <ComboBox
                aria-label={t('selectLocation', 'Select a location')}
                id="location"
                invalidText={t('required', 'Required')}
                items={locationsToShow}
                itemToString={(location: Location) => location?.display}
                onBlur={onBlur}
                onChange={({ selectedItem }) => onChange(selectedItem)}
                onInputChange={(searchTerm) => handleSearch(searchTerm)}
                readOnly={disableChangingVisitLocation}
                selectedItem={value}
                titleText={t('selectLocation', 'Select a location')}
              />
            )}
          />
        ) : (
          <p className={styles.bodyShort02}>{defaultVisitLocation?.display}</p>
        )}
      </div>
    </section>
  );
};

export default LocationSelector;
