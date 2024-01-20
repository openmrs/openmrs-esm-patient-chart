import React, { useState } from 'react';
import classNames from 'classnames';
import { ComboBox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { type Location, type OpenmrsResource, useConfig, useSession } from '@openmrs/esm-framework';
import { useDefaultLoginLocation } from '../hooks/useDefaultLoginLocation';
import { useLocations } from '../hooks/useLocations';
import { type VisitFormData } from './visit-form.resource';
import { type ChartConfig } from '../../config-schema';
import styles from './visit-form.scss';

const LocationSelector = () => {
  const { t } = useTranslation();
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedSessionLocation = useSession().sessionLocation;
  const { locations, isLoading: isLoadingLocations, error } = useLocations(searchTerm);
  const { defaultLoginLocation, isLoadingDefaultLoginLocation } = useDefaultLoginLocation();
  const config = useConfig() as ChartConfig;
  const disableChangingVisitLocation = config?.disableChangingVisitLocation;
  const locationsToShow: Array<OpenmrsResource> =
    !isLoadingDefaultLoginLocation && defaultLoginLocation
      ? [defaultLoginLocation]
      : locations
      ? locations
      : selectedSessionLocation
      ? [selectedSessionLocation]
      : [];

  const { control } = useFormContext<VisitFormData>();

  const handleSearch = (searchString) => {
    setSearchTerm(searchString);
  };

  return (
    <section data-testid="combo">
      <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
      <div className={classNames(styles.selectContainer, styles.sectionField)}>
        {!disableChangingVisitLocation ? (
          <Controller
            name="visitLocation"
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <ComboBox
                titleText={t('selectLocation', 'Select a location')}
                aria-label={t('selectLocation', 'Select a location')}
                id="location"
                invalidText="Required"
                items={locationsToShow}
                selectedItem={value}
                onChange={({ selectedItem }) => onChange(selectedItem)}
                onBlur={onBlur}
                itemToString={(location: Location) => location?.display}
                onInputChange={(location) => handleSearch(location)}
                readOnly={disableChangingVisitLocation}
              />
            )}
          />
        ) : (
          <p className={styles.bodyShort02}>{session?.sessionLocation?.display}</p>
        )}
      </div>
    </section>
  );
};

export default LocationSelector;
