import React from 'react';
import styles from './pagination.component.scss';
import { Pagination } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, useLayoutType } from '@openmrs/esm-framework';
import { usePaginationInfo } from './usePaginationInfo';

interface PatientChartPaginationProps {
  currentItems: number;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  onPageNumberChange?: any;
  dashboardLinkUrl?: string;
  dashboardLinkLabel?: string;
}

export const PatientChartPagination: React.FC<PatientChartPaginationProps> = ({
  totalItems,
  pageSize,
  onPageNumberChange,
  pageNumber,
  dashboardLinkUrl,
  currentItems,
  dashboardLinkLabel: urlLabel,
}) => {
  const { t } = useTranslation();
  const { itemsDisplayed, pageSizes } = usePaginationInfo(pageSize, totalItems, pageNumber, currentItems);
  const isTablet = useLayoutType() === 'tablet';

  return (
    <>
      {totalItems > 0 && (
        <div className={isTablet ? styles.tablet : styles.desktop}>
          <div>
            {itemsDisplayed}
            {dashboardLinkUrl && (
              <ConfigurableLink to={dashboardLinkUrl} className={styles.configurableLink}>
                {urlLabel ?? t('seeAll', 'See all')}
              </ConfigurableLink>
            )}
          </div>
          <Pagination
            className={styles.pagination}
            page={pageNumber}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={totalItems}
            onChange={onPageNumberChange}
          />
        </div>
      )}
    </>
  );
};
