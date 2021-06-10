import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './pagination.component.scss';
import Pagination from 'carbon-components-react/es/components/Pagination';
import chunk from 'lodash-es/chunk';

interface PatientChartPaginationProps {
  items: Array<unknown>;
  pageNumber: number;
  pageSize: number;
  onPageNumberChange?: any;
  pageUrl: string;
  currentPage: Array<unknown>;
}

/**
 * @param items The items to be paged.
 * @param pageNumber The number of the page to be returned as the first result element. Not zero-based!
 *                   The first page has the number 1.
 * @param pageSize The number of items per page.
 * @param onPageNumberChange The function called when page Number is changed
 * @param pageUrl The url to redirect when see all link is clicked
 * @param currentPage The currentPage items to be displayed
 */

const PatientChartPagination: React.FC<PatientChartPaginationProps> = ({
  items,
  pageSize,
  onPageNumberChange,
  pageNumber,
  pageUrl,
  currentPage,
}) => {
  const { t } = useTranslation();
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

/**
 * Paginates the specified array into a set of pages and returns the page with the specified page number.
 * @param items The items to be paged.
 * @param pageNumber The number of the page to be returned as the first result element. Not zero-based!
 *                   The first page has the number 1.
 * @param itemsPerPage The number of items per page.
 */
export function paginate<T>(items: Array<T>, pageNumber: number, itemsPerPage: number): [Array<T>, Array<Array<T>>] {
  const allPages = chunk(items, itemsPerPage);
  const page = allPages[pageNumber - 1] ?? [];
  return [page, allPages];
}

export default PatientChartPagination;
