import React, { useId, useMemo, useState } from 'react';
import fuzzy from 'fuzzy';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  type DataTableHeader,
  type DataTableRow,
  DataTableSkeleton,
  Layer,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { useLayoutType, isDesktop, useDebounce, ConfigurableLink } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { type MappedListMembers } from '../patient-lists.resource';
import styles from './patient-list-details-table.scss';

interface PatientListDetailsTableProps {
  isLoading: boolean;
  listMembers: Array<MappedListMembers>;
}

const PatientListDetailsTable: React.FC<PatientListDetailsTableProps> = ({ listMembers, isLoading }) => {
  const { t } = useTranslation();
  const id = useId();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);

  const tableHeaders: Array<typeof DataTableHeader> = useMemo(
    () => [
      {
        key: 'name',
        header: t('name', 'Name'),
      },
      {
        key: 'identifier',
        header: t('identifier', 'Identifier'),
      },
      {
        key: 'sex',
        header: t('sex', 'Sex'),
      },
      {
        key: 'startDate',
        header: t('startDate', 'Start Date'),
      },
    ],
    [t],
  );

  const filteredListMembers = useMemo(() => {
    if (!debouncedSearchTerm) {
      return listMembers;
    }

    return debouncedSearchTerm
      ? fuzzy
          .filter(debouncedSearchTerm, listMembers, {
            extract: (member) => `${member.name} ${member.identifier} ${member.sex}`,
          })
          .sort((r1, r2) => r1.score - r2.score)
          .map((result) => result.original)
      : listMembers;
  }, [debouncedSearchTerm, listMembers]);

  const tableRows: Array<typeof DataTableRow> = useMemo(
    () =>
      filteredListMembers?.map((member) => ({
        id: member.patientUuid,
        ...member,
      })) ?? [],
    [filteredListMembers],
  );

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <DataTableSkeleton className={styles.dataTableSkeleton} rowCount={5} columnCount={5} zebra />
      </div>
    );
  }

  if (listMembers?.length > 0) {
    return (
      <section>
        <>
          <Layer>
            <Search
              id={`${id}-search`}
              labelText=""
              onChange={handleSearchTermChange}
              placeholder={t('searchThisList', 'Search this list')}
              size={responsiveSize}
            />
          </Layer>
          <DataTable
            aria-label="patient list details"
            rows={tableRows}
            headers={tableHeaders}
            size={responsiveSize}
            useZebraStyles
          >
            {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
              <TableContainer>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const currentPatient = listMembers.find((member) => member.patientUuid === row.id);

                      return (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          <TableCell>
                            <ConfigurableLink
                              className={styles.link}
                              key={row.id}
                              to={window.getOpenmrsSpaBase() + `patient/${currentPatient.patientUuid}/chart`}
                            >
                              {currentPatient.name}
                            </ConfigurableLink>
                          </TableCell>
                          <TableCell>{currentPatient.identifier}</TableCell>
                          <TableCell>{currentPatient.sex}</TableCell>
                          <TableCell>{currentPatient.startDate}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {filteredListMembers?.length === 0 ? (
            <div className={styles.filterEmptyState}>
              <Layer level={0}>
                <Tile className={styles.filterEmptyStateTile}>
                  <p className={styles.filterEmptyStateContent}>
                    {t('noMatchingPatients', 'No matching patients to display')}
                  </p>
                  <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
                </Tile>
              </Layer>
            </div>
          ) : null}
        </>
      </section>
    );
  }

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={styles.illo}>
          <EmptyDataIllustration />
        </div>
        <p className={styles.content}>{t('noPatientsInList', 'There are no patients in this list')}</p>
      </Tile>
    </Layer>
  );
};

export default PatientListDetailsTable;
