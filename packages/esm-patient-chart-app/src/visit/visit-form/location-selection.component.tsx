import React from 'react';
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
  const selectedSessionLocation = useSession().sessionLocation;
  const { locations } = useLocations('');
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

  return (
    <section data-testid="combo">
      <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
      <div className={`${styles.selectContainer} ${styles.sectionField}`}>
        <Controller
          name="visitLocation"
          control={control}
          render={({ field: { value } }) => (
            <ComboBox
              titleText={t('selectLocation', 'Select a location')}
              aria-label={t('selectLocation', 'Select a location')}
              id="location"
              items={locationsToShow}
              selectedItem={value}
              itemToString={(loc: Location) => loc?.display}
              disabled={true}
            />
          )}
        />
      </div>
    </section>
  );
};

export default LocationSelector;
