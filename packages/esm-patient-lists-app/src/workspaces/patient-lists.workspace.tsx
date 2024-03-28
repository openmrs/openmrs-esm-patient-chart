import React, { useCallback, useMemo, useState } from 'react';
import fuzzy from 'fuzzy';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  type DataTableHeader,
  type DataTableRow,
  DataTableSkeleton,
  Layer,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { launchPatientWorkspace, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { useDebounce, useLayoutType } from '@openmrs/esm-framework';
import { usePatientLists } from '../patient-lists.resource';
import styles from './patient-lists.scss';

function PatientListsWorkspace() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = layout === 'tablet' ? 'lg' : 'sm';
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { patientLists, isLoading } = usePatientLists();

  const launchListDetailsWorkspace = useCallback((list) => {
    launchPatientWorkspace('patient-list-details', { list, workspaceTitle: list.name });
  }, []);

  const tableHeaders: Array<typeof DataTableHeader> = [
    {
      key: 'name',
      header: t('listName', 'List name'),
    },
    {
      key: 'type',
      header: t('listType', 'List type'),
    },
    {
      key: 'size',
      header: t('numberOfPatients', 'No. of patients'),
    },
  ];

  const filteredLists = useMemo(() => {
    if (!debouncedSearchTerm) {
      return patientLists;
    }

    return debouncedSearchTerm
      ? fuzzy
          .filter(debouncedSearchTerm, patientLists, {
            extract: (list) => `${list.name} ${list.type}`,
          })
          .sort((r1, r2) => r1.score - r2.score)
          .map((result) => (result ? result.original : null))
      : patientLists;
  }, [debouncedSearchTerm, patientLists]);

  const tableRows: Array<typeof DataTableRow> = useMemo(
    () =>
      filteredLists?.map((list) => ({
        ...list,
        numberOfPatients: list.size,
      })) ?? [],
    [filteredLists],
  );

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  if (isLoading)
    return (
      <div className={styles.skeletonContainer}>
        <DataTableSkeleton className={styles.dataTableSkeleton} rowCount={5} columnCount={5} zebra />
      </div>
    );

  if (patientLists?.length > 0) {
    return (
      <section className={styles.container}>
        <DataTable headers={tableHeaders} rows={tableRows} size={responsiveSize} useZebraStyles>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <>
              <TableContainer className={styles.tableContainer}>
                <div className={styles.toolbarWrapper}>
                  <TableToolbar className={styles.tableToolbar}>
                    <TableToolbarContent>
                      <TableToolbarSearch
                        className={styles.search}
                        expanded
                        onChange={handleSearchTermChange}
                        placeholder={t('searchThisList', 'Search this list')}
                        size={responsiveSize}
                      />
                    </TableToolbarContent>
                  </TableToolbar>
                </div>
                {rows.length > 0 ? (
                  <Table aria-label="patient lists" className={styles.table} {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => {
                        const currentList = patientLists?.find((list) => list?.id === row.id);

                        if (!currentList) return null;

                        return (
                          <TableRow {...getRowProps({ row })} key={row.id}>
                            <TableCell>
                              <Link className={styles.link} onClick={() => launchListDetailsWorkspace(currentList)}>
                                {currentList?.name ?? ''}
                              </Link>
                            </TableCell>
                            <TableCell>{currentList?.type ?? ''}</TableCell>
                            <TableCell>{currentList?.size ?? ''}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : null}
              </TableContainer>
              {filteredLists?.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noMatchingListsFound', 'No matching lists to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </>
          )}
        </DataTable>
      </section>
    );
  }

  return (
    <div className={styles.emptyStateContainer}>
      <Layer>
        <Tile className={styles.emptyStateTile}>
          <div className={styles.tileContent}>
            <EmptyDataIllustration />
            <p className={styles.emptyStateContent}>{t('noPatientListsToDisplay', 'No patient lists to display')}</p>
          </div>
        </Tile>
      </Layer>
    </div>
  );
}

export default PatientListsWorkspace;
