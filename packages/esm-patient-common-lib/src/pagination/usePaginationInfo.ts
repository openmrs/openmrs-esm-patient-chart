import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Computes pagination metadata for the PatientChartPagination component.
 *
 * @param pageSize - Number of items per page
 * @param totalItems - Total number of items across all pages
 * @param pageNumber - Current page number (1-indexed)
 * @param currentItems - Number of items on the current page
 *
 * @returns
 * - `pageSizes` — array of cumulative page sizes for the page size selector
 * - `itemsDisplayed` — formatted "X / Y items" string for screen readers and sighted users
 *
 * The `itemsDisplayed` string is translated via i18n so clinicians using
 * the system in non-English languages also see localized pagination labels.
 */
export function usePaginationInfo(pageSize: number, totalItems: number, pageNumber: number, currentItems: number) {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');

  const pageSizes = useMemo(() => {
    let numberOfPages = Math.ceil(totalItems / pageSize);
    if (isNaN(numberOfPages)) {
      numberOfPages = 0;
    }

    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * pageSize;
    });
  }, [pageSize, totalItems]);

  const itemsDisplayed = useMemo(() => {
    let pageItemsCount = 0;
    if (pageSize > totalItems) {
      pageItemsCount = totalItems;
    } else if (pageSize * pageNumber > totalItems) {
      pageItemsCount = pageSize * (pageNumber - 1) + currentItems;
    } else {
      pageItemsCount = pageSize * pageNumber;
    }

    return t('paginationItemsCount', `{{pageItemsCount}} / {{count}} items`, { count: totalItems, pageItemsCount });
  }, [pageSize, totalItems, pageNumber, currentItems, t]);

  return {
    pageSizes,
    itemsDisplayed,
  };
}
