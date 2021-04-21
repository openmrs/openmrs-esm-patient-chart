import React from "react";
import dayjs from "dayjs";
import ProgramsForm from "./programs-form.component";
import EmptyState from "./empty-state/empty-state.component";
import ErrorState from "./error-state/error-state.component";
import Add16 from "@carbon/icons-react/es/add/16";
import Button from "carbon-components-react/es/components/Button";
import Pagination from "carbon-components-react/es/components/Pagination";
import DataTableSkeleton from "carbon-components-react/es/components/DataTableSkeleton";
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react/es/components/DataTable";
import styles from "./programs-overview.scss";
import { useTranslation } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-framework";
import { fetchActiveEnrollments } from "./programs.resource";
import { openWorkspaceTab } from "./openWorkspaceTab";
import { PatientProgram } from "../types";

interface ProgramsOverviewProps {
  basePath: string;
  patientUuid: string;
}

const ProgramsOverview: React.FC<ProgramsOverviewProps> = ({ patientUuid }) => {
  const programsToShowCount = 5;
  const { t } = useTranslation();
  const [programs, setPrograms] = React.useState<Array<PatientProgram>>(null);
  const [error, setError] = React.useState(null);
  const [firstRowIndex, setFirstRowIndex] = React.useState(0);
  const [currentPageSize, setCurrentPageSize] = React.useState(5);

  const displayText = t("programs", "program enrollments");
  const headerTitle = t("carePrograms", "Care Programs");
  const previousPage = t("previousPage", "Previous page");
  const nextPage = t("nextPage", "Next Page");
  const itemPerPage = t("itemPerPage", "Item per page");

  React.useEffect(() => {
    if (patientUuid) {
      const sub = fetchActiveEnrollments(patientUuid).subscribe(
        (programs) => setPrograms(programs),
        (error) => {
          setError(error);
          createErrorHandler();
        }
      );

      return () => sub.unsubscribe();
    }
  }, [patientUuid]);

  const launchProgramsForm = () => {
    openWorkspaceTab(ProgramsForm, t("programsForm", "Programs form"));
  };

  const headers = [
    {
      key: "display",
      header: t("activePrograms", "Active programs"),
    },
    {
      key: "dateEnrolled",
      header: t("dateEnrolled", "Date enrolled"),
    },
  ];

  const getRowItems = (rows: Array<PatientProgram>) => {
    return rows
      .slice(firstRowIndex, firstRowIndex + currentPageSize)
      .map((row) => ({
        id: row.uuid,
        display: row.display,
        dateEnrolled: dayjs(row.dateEnrolled).format("MMM-YYYY"),
      }));
  };

  const RenderPrograms = () => {
    if (programs.length) {
      const rows = getRowItems(programs);
      return (
        <div>
          <div className={styles.programsHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
              {headerTitle}
            </h4>
            <Button
              kind="ghost"
              renderIcon={Add16}
              iconDescription="Add programs"
              onClick={launchProgramsForm}
            >
              {t("add", "Add")}
            </Button>
          </div>
          <TableContainer>
            <DataTable
              rows={rows}
              headers={headers}
              isSortable={true}
              size="short"
            >
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
                          })}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.value?.content ?? cell.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          </TableContainer>
          {programs?.length > programsToShowCount && (
            <Pagination
              totalItems={programs.length}
              backwardText={previousPage}
              forwardText={nextPage}
              pageSize={currentPageSize}
              pageSizes={[5, 10, 15, 25]}
              itemsPerPageText={itemPerPage}
              onChange={({ page, pageSize }) => {
                if (pageSize !== currentPageSize) {
                  setCurrentPageSize(pageSize);
                }
                setFirstRowIndex(pageSize * (page - 1));
              }}
            />
          )}
        </div>
      );
    }
    return (
      <EmptyState
        displayText={displayText}
        headerTitle={headerTitle}
        launchForm={launchProgramsForm}
      />
    );
  };

  return (
    <>
      {programs ? (
        <RenderPrograms />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={programsToShowCount} />
      )}
    </>
  );
};

export default ProgramsOverview;
