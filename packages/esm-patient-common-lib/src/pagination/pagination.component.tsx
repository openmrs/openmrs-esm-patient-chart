import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Pagination } from '@carbon/react';
import { ConfigurableLink, useLayoutType } from '@openmrs/esm-framework';
import { usePaginationInfo } from './usePaginationInfo';
import styles from './pagination.scss';

interface PatientChartPaginationProps {
  currentItems: number;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  onPageNumberChange?: any;
  dashboardLinkUrl?: string;
  dashboardLinkLabel?: string;
  grey?: boolean;
}

export const PatientChartPagination: React.FC<PatientChartPaginationProps> = ({
  totalItems,
  pageSize,
  onPageNumberChange,
  pageNumber,
  dashboardLinkUrl,
  currentItems,
  dashboardLinkLabel: urlLabel,
  grey,
}) => {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');
  const { itemsDisplayed, pageSizes } = usePaginationInfo(pageSize, totalItems, pageNumber, currentItems);
  const isTablet = useLayoutType() === 'tablet';

  return (
    <>
      {totalItems > 0 && (
        <div
          className={classNames(
            isTablet ? styles.tablet : styles.desktop,
            styles.paginationContainer,
            grey ? styles.greyBackground : '',
          )}
        >
          <div>
            {itemsDisplayed}
            {dashboardLinkUrl && (
              <ConfigurableLink to={dashboardLinkUrl} className={styles.configurableLink}>
                {urlLabel ?? t('seeAll', 'See all')}
              </ConfigurableLink>
            )}
          </div>
          <Pagination
            className={classNames(styles.pagination, grey ? styles.greyBackground : '')}
            page={pageNumber}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={totalItems}
            onChange={onPageNumberChange}
            pageRangeText={(_, total) => t('paginationPageText', 'of {{count}} pages', { count: total })}
            size={isTablet ? 'lg' : 'sm'}
          />
        </div>
      )}
    </>
  );
};
