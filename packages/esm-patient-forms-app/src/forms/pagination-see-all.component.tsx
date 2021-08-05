import React, { FunctionComponent } from 'react';
import Pagination from 'carbon-components-react/es/components/Pagination';
import styles from '@openmrs/esm-patient-common-lib/src/pagination/pagination.component.scss';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

interface PatientChartPaginationProps {
  currentItems: number;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  onPageNumberChange?: any;
  pageUrl?: string;
}

export const PatientChartPagination: FunctionComponent<PatientChartPaginationProps> = ({
  totalItems,
  pageSize,
  onPageNumberChange,
  pageNumber,
  pageUrl = '',
  currentItems,
}) => {
  const { t } = useTranslation();
  const { itemsDisplayed, pageSizes } = usePaginationInfo(pageSize, totalItems, pageNumber, currentItems);

  return (
    <>
      {totalItems > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationLink}>
            {itemsDisplayed}
            {pageUrl && (
              <ConfigurableLink to={pageUrl} className={styles.configurableLink}>
                {t('goToSummary', 'Go to Summary')}
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
