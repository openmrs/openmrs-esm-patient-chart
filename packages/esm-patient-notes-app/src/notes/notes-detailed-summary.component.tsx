import React from 'react';
import styles from './notes-overview.scss';
import { EmptyState, ErrorState, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { attach, createErrorHandler, usePagination, useVisit, VisitItem } from '@openmrs/esm-framework';
import Add16 from '@carbon/icons-react/es/add/16';
import Button from 'carbon-components-react/es/components/Button';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react/es/components/DataTable';
import { getEncounterObservableRESTAPI, PatientNote } from './encounter.resource';
import { formatNotesDate } from './notes-helper';
import { useNotesContext } from './notes.context';
const notesToShowCount = 5;

interface NotesDetailedSummaryProps {
  showAddNote: boolean;
}

const NotesDetailedSummary: React.FC<NotesDetailedSummaryProps> = ({ showAddNote }) => {
  const { t } = useTranslation();
  const displayText = t('notes', 'Notes');
  const headerTitle = t('notes', 'Notes');

  const { patientUuid } = useNotesContext();
  const { currentVisit } = useVisit(patientUuid);
  const [notes, setNotes] = React.useState<Array<PatientNote>>(null);
  const [showAllNotes, setShowAllNotes] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (patientUuid) {
      const sub = getEncounterObservableRESTAPI(patientUuid).subscribe(setNotes, (err) => {
        setError(err);
        createErrorHandler();
      });

      return () => sub.unsubscribe();
    }
  }, [patientUuid]);

  const toggleShowAllNotes = React.useCallback(() => {
    setShowAllNotes((current) => !current);
  }, []);

  const headers = [
    {
      key: 'encounterDate',
      header: t('date', 'Date'),
    },
    {
      key: 'encounterType',
      header: t('encounterType', 'Encounter type'),
    },
    {
      key: 'encounterLocation',
      header: t('location', 'Location'),
    },
    {
      key: 'encounterAuthor',
      header: t('author', 'Author'),
    },
  ];

  const launchVisitNoteForm = React.useCallback(() => {
    if (currentVisit) {
      attach('patient-chart-workspace-slot', 'visit-notes-workspace');
    } else {
      launchStartVisitPrompt();
    }
  }, [currentVisit]);

  const getRowItems = (rows: Array<PatientNote>) => {
    return rows?.slice(0, showAllNotes ? rows.length : notesToShowCount).map((row) => ({
      ...row,
      encounterDate: formatNotesDate(row.encounterDate),
    }));
  };

  function RenderNotes() {
    if (notes.length) {
      return (
        <div>
          <div className={styles.notesHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
            {showAddNote && (
              <Button kind="ghost" renderIcon={Add16} iconDescription="Add notes" onClick={launchVisitNoteForm}>
                {t('add', 'Add')}
              </Button>
            )}
          </div>
          <TableContainer>
            <DataTable rows={getRowItems(notes)} headers={headers} isSortable={true} size="short">
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={`${styles.productiveHeading01} ${styles.text02}`}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}>
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {!showAllNotes && notes?.length > notesToShowCount && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <span
                            style={{
                              display: 'inline-block',
                              margin: '0.45rem 0rem',
                            }}>
                            {`${notesToShowCount} / ${notes.length}`} {t('items', 'items')}
                          </span>
                          <Button size="small" kind="ghost" onClick={toggleShowAllNotes}>
                            {t('seeAll', 'See all')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          </TableContainer>
        </div>
      );
    }
    return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchVisitNoteForm} />;
  }

  return (
    <>
      {notes ? (
        <RenderNotes />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={5} />
      )}
    </>
  );
};

export default NotesDetailedSummary;
