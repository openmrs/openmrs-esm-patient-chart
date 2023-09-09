import React, { useState } from 'react';
import styles from './visit-form.scss';
import { Location, OpenmrsResource, useLayoutType, useSession } from '@openmrs/esm-framework';
import { ComboBox, InlineNotification } from '@carbon/react';
import { useDefaultLoginLocation } from '../hooks/useDefaultLocation';
import { useTranslation } from 'react-i18next';
import { useLocations } from '../hooks/useLocations';
import isEmpty from 'lodash/isEmpty';
import { useFormContext, Controller } from 'react-hook-form';
import { VisitFormData } from './visit-form.component';

const LocationSelector = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedSessionLocation = useSession().sessionLocation;
  const { locations, isLoading: isLoadingLocations, error } = useLocations(searchTerm);
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();
  const locationsToShow: Array<OpenmrsResource> =
    !loadingDefaultFacility && !isEmpty(defaultFacility)
      ? [defaultFacility]
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
      <div className={`${styles.selectContainer} ${styles.sectionField}`}>
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
              itemToString={(loc: Location) => loc?.display}
              onInputChange={(loc) => handleSearch(loc)}
            />
          )}
        />
      </div>
    </section>
  );
};

export default LocationSelector;
