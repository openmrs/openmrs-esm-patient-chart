import React, { useState } from 'react';
import styles from './visit-form.scss';
import { Location, OpenmrsResource, useLayoutType, useSession } from '@openmrs/esm-framework';
import { ComboBox, InlineNotification } from '@carbon/react';
import { useDefaultLoginLocation } from '../hooks/useDefaultLocation';
import { useTranslation } from 'react-i18next';
import { useLocations } from '../hooks/useLocations';
import isEmpty from 'lodash/isEmpty';

interface LocationSelectorProps {
  selectedLocation: string;
  setSelectedLocation: (x: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedLocation, setSelectedLocation }) => {
  const isTablet = useLayoutType();
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

  const handleSearch = (searchString) => {
    setSearchTerm(searchString);
  };

  return (
    <section data-testid="combo">
      <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
      <div className={`${styles.selectContainer} ${styles.sectionField}`}>
        <ComboBox
          titleText={t('selectLocation', 'Select a location')}
          aria-label={t('selectLocation', 'Select a location')}
          id="location"
          invalidText="Required"
          items={locationsToShow}
          selectedItem={locationsToShow?.find((location) => location?.uuid === selectedLocation)}
          onChange={({ selectedItem }) => setSelectedLocation(selectedItem?.uuid)}
          itemToString={(loc: Location) => loc?.display}
          onInputChange={(loc) => handleSearch(loc)}
        />
      </div>
    </section>
  );
};

export default LocationSelector;
