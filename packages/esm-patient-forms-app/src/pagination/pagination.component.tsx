import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './pagination.component.scss';
import Pagination from 'carbon-components-react/es/components/Pagination';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface PatientChartPaginationProps {
  items: Array<unknown>;
  pageNumber: number;
  pageSize: number;
  onPageNumberChange?: any;
  pageUrl: string;
  currentPage: Array<unknown>;
  patientUuid: string;
}

/**
 * @param items The items to be paged.
 * @param pageNumber The number of the page to be returned as the first result element. Not zero-based!
 *                   The first page has the number 1.
 * @param pageSize The number of items per page.
 * @param onPageNumberChange The function called when page Number is changed
 * @param pageUrl The url to redirect when see all link is clicked
 * @param currentPage The currentPage items to be displayed
 * @param patientUuid The current patient Uuid
 */

const PatientChartPagination: React.FC<PatientChartPaginationProps> = ({
  items,
  pageSize,
  onPageNumberChange,
  pageNumber,
  pageUrl,
  currentPage,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const chartBasePath = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/`;

  const generatePageSizes = () => {
    const numberOfPages = Math.ceil(items?.length / pageSize);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * pageSize;
    });
  };

  const numberOfItemsDisplayed = () => {
    const totalItems = items.length;
    if (pageSize > totalItems) return `${totalItems} / ${totalItems} `;
    if (pageSize * pageNumber > totalItems) {
      return `${pageSize * (pageNumber - 1) + currentPage.length} / ${totalItems} `;
    } else {
      return `${pageSize * pageNumber} / ${totalItems} `;
    }
  };

  return (
    <>
      {items.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationLink}>
            {numberOfItemsDisplayed()}
            {t('items', ' items')}
            <ConfigurableLink to={`${chartBasePath}${pageUrl}`} className={styles.configurableLink}>
              {t('seeAll', 'See all')}
            </ConfigurableLink>
          </div>
          <Pagination
            className={styles.pagination}
            page={pageNumber}
            pageSize={pageSize}
            pageSizes={generatePageSizes()}
            totalItems={items.length}
            onChange={onPageNumberChange}
          />
        </div>
      )}
    </>
  );
};

export default PatientChartPagination;
