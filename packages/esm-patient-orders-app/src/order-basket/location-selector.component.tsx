import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { IconButton, RadioButton, RadioButtonGroup, RadioButtonSkeleton, Search } from '@carbon/react';
import { type ControllerRenderProps } from 'react-hook-form';
import { type RadioButtonGroupProps } from '@carbon/react/lib/components/RadioButtonGroup/RadioButtonGroup';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  isDesktop,
  ResponsiveWrapper,
  useDebounce,
  useLayoutType,
  type Location,
} from '@openmrs/esm-framework';
import useLocations from './location-selector.resources';
import styles from './location-selector.scss';

interface LocationSelectorProps extends RadioButtonGroupProps {
  paginationSize?: number;

  /**
   * If provided, limits the locations to child locations of the given ancestor location.
   */
  ancestorLocation?: Location;

  /**
   * a list of locations that should be filtered from the location selector
   */
  excludeLocations?: Location[];

  onChange: (locationUuid?: string) => void;

  name: string;
}

export default function LocationSelector({
  paginationSize = 15,
  ancestorLocation,
  excludeLocations: locationsToFilter,
  onChange,
  name,
}: LocationSelectorProps) {
  const { t } = useTranslation();
  const isTablet = !isDesktop(useLayoutType());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const filterCriteria: Array<Array<string>> = useMemo(() => {
    const criteria = [];
    if (debouncedSearchTerm) {
      criteria.push(['name:contains', debouncedSearchTerm]);
    }
    if (ancestorLocation) {
      // limit to locations that are "part of" the facility where the patient has an active visit
      criteria.push(['partof:below', ancestorLocation.uuid]);
    }
    return criteria;
  }, [debouncedSearchTerm, ancestorLocation]);

  const {
    data: locations,
    isLoading,
    totalCount,
    currentPage,
    totalPages,
    goToNext,
    goToPrevious,
  } = useLocations(filterCriteria, paginationSize);

  const filteredLocations = locations?.filter((l) => !locationsToFilter?.some((fl) => fl.uuid === l.id));

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [setSearchTerm],
  );

  return (
    <div className={styles.locationSelector}>
      <ResponsiveWrapper>
        <Search
          labelText={t('searchLocations', 'Search locations')}
          onChange={handleSearch}
          value={searchTerm}
          placeholder={t('searchLocations', 'Search locations')}
          size={isTablet ? 'lg' : 'md'}
        />
      </ResponsiveWrapper>
      {isLoading ? (
        <div className={styles.radioButtonGroup}>
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
        </div>
      ) : (
        <ResponsiveWrapper>
          <RadioButtonGroup
            onChange={(value) => onChange(value as string)}
            className={styles.radioButtonGroup}
            orientation="vertical"
            name={name}
          >
            {filteredLocations?.length > 0 ? (
              filteredLocations?.map((location) => (
                <RadioButton key={location.id} labelText={location.name} value={location.id} />
              ))
            ) : (
              <span className={styles.bodyShort01}>{t('noLocationsFound', 'No locations found')}</span>
            )}
          </RadioButtonGroup>
        </ResponsiveWrapper>
      )}
      {totalCount > paginationSize && (
        <div className={styles.pagination}>
          <span className={styles.bodyShort01}>
            {t('showingLocations', '{{start}}-{{end}} of {{count}} locations', {
              start: (currentPage - 1) * paginationSize + 1,
              end: Math.min(currentPage * paginationSize, totalCount),
              count: totalCount,
            })}
          </span>
          <div>
            <IconButton
              className={classNames(styles.button, styles.buttonLeft)}
              disabled={currentPage === 1}
              kind="ghost"
              label={t('previousPage', 'Previous page')}
              onClick={() => goToPrevious()}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              className={styles.button}
              disabled={currentPage >= totalPages}
              kind="ghost"
              label={t('nextPage', 'Next page')}
              onClick={() => goToNext()}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
