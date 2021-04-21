import React from "react";
import Button from "carbon-components-react/es/components/Button";
import DataTableSkeleton from "carbon-components-react/es/components/DataTableSkeleton";
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "carbon-components-react/es/components/DataTable";
import Add16 from "@carbon/icons-react/es/add/16";
import EmptyState from "./empty-state/empty-state.component";
import ErrorState from "./error-state/error-state.component";
import styles from "./notes-overview.scss";
import { useTranslation } from "react-i18next";
import { attach } from "@openmrs/esm-framework";
import {
  getEncounterObservableRESTAPI,
  PatientNote
} from "./encounter.resource";
import { formatNotesDate } from "./notes-helper";

interface NotesOverviewProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

const NotesOverview: React.FC<NotesOverviewProps> = ({
  patientUuid,
  patient
}) => {
  const notesToShowCount = 5;
  const { t } = useTranslation();
  const [notes, setNotes] = React.useState<Array<PatientNote>>(null);
  const [error, setError] = React.useState(null);
  const [showAllNotes, setShowAllNotes] = React.useState(false);
  const displayText = t("notes", "notes");
  const headerTitle = t("notes", "Notes");

  React.useEffect(() => {
    if (patient && patientUuid) {
      const sub = getEncounterObservableRESTAPI(patientUuid).subscribe(
        notes => setNotes(notes),
        setError
      );
      return () => sub.unsubscribe();
    }
  }, [patient, patientUuid]);

  const toggleShowAllNotes = () => {
    setShowAllNotes(!showAllNotes);
  };

  const launchVisitNoteForm = () => {
    attach("patient-chart-workspace-context", "visit-notes-workspace");
  };

  const headers = [
    {
      key: "encounterDate",
      header: t("date", "Date")
    },
    {
      key: "encounterType",
      header: t("encounterType", "Encounter type")
    },
    {
      key: "encounterLocation",
      header: t("location", "Location")
    },
    {
      key: "encounterAuthor",
      header: t("author", "Author")
    }
  ];

  const getRowItems = (rows: Array<PatientNote>) => {
    return rows
      ?.slice(0, showAllNotes ? rows.length : notesToShowCount)
      .map(row => ({
        ...row,
        encounterDate: formatNotesDate(row.encounterDate),
        author: row.encounterAuthor ? row.encounterAuthor : "\u2014"
      }));
  };

  return (
    <>
      {notes ? (
        notes.length ? (
          <div>
            <div className={styles.notesHeader}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
                {headerTitle}
              </h4>
              <Button
                kind="ghost"
                renderIcon={Add16}
                iconDescription="Add visit note"
                onClick={launchVisitNoteForm}
              >
                {t("add", "Add")}
              </Button>
            </div>
            <TableContainer>
              <DataTable
                rows={getRowItems(notes)}
                headers={headers}
                isSortable={true}
                size="short"
              >
                {({ rows, headers, getHeaderProps, getTableProps }) => (
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map(header => (
                          <TableHeader
                            className={`${styles.productiveHeading01} ${styles.text02}`}
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable
                            })}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => (
                        <TableRow key={row.id}>
                          {row.cells.map(cell => (
                            <TableCell key={cell.id}>
                              {cell.value?.content ?? cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {!showAllNotes && notes?.length > notesToShowCount && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <span
                              style={{
                                display: "inline-block",
                                margin: "0.45rem 0rem"
                              }}
                            >
                              {`${notesToShowCount} / ${notes.length}`}{" "}
                              {t("items", "items")}
                            </span>
                            <Button
                              size="small"
                              kind="ghost"
                              onClick={toggleShowAllNotes}
                            >
                              {t("seeAll", "See all")}
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
        ) : (
          <EmptyState
            displayText={displayText}
            headerTitle={headerTitle}
            launchForm={launchVisitNoteForm}
          />
        )
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={notesToShowCount} />
      )}
    </>
  );
};

export default NotesOverview;
