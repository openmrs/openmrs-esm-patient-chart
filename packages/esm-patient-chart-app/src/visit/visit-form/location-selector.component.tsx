import React, { useState } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { ComboBox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Control, Controller } from 'react-hook-form';
import { type Location, type OpenmrsResource, useConfig, useSession } from '@openmrs/esm-framework';
import { type VisitFormData } from './visit-form.resource';
import { useDefaultLoginLocation } from '../hooks/useDefaultLocation';
import { useLocations } from '../hooks/useLocations';
import { type ChartConfig } from '../../config-schema';
import styles from './visit-form.scss';

interface LocationSelectorProps {
  control: Control<VisitFormData>;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ control }) => {
  const { t } = useTranslation();
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const selectedSessionLocation = useSession().sessionLocation;
  const { locations } = useLocations(searchTerm);
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();
  const config = useConfig<ChartConfig>();
  const disableChangingVisitLocation = config?.disableChangingVisitLocation;
  const locationsToShow: Array<OpenmrsResource> =
    !loadingDefaultFacility && !isEmpty(defaultFacility)
      ? [defaultFacility]
      : locations
      ? locations
      : selectedSessionLocation
      ? [selectedSessionLocation]
      : [];

  const handleSearch = (searchString) => {
    setSearchTerm(searchString);
  };

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
          <p className={styles.bodyShort02}>{session?.sessionLocation?.display}</p>
        )}
      </div>
    </section>
  );
};

export default LocationSelector;
