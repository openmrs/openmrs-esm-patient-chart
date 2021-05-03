import React from "react";
import dayjs from "dayjs";
import Button from "carbon-components-react/es/components/Button";
import DataTableSkeleton from "carbon-components-react/es/components/DataTableSkeleton";
import Pagination from "carbon-components-react/es/components/Pagination";
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react/es/components/DataTable";
import Add16 from "@carbon/icons-react/es/add/16";
import ConditionsForm from "./conditions-form.component";
import styles from "./conditions-overview.scss";
import {
  EmptyState,
  ErrorState,
  openWorkspaceTab,
} from "@openmrs/esm-patient-common-lib";
import { useTranslation } from "react-i18next";
import {
  Condition,
  performPatientConditionsSearch,
} from "./conditions.resource";

interface ConditionsOverviewProps {
  basePath: string;
  patient: fhir.Patient;
}

const ConditionsOverview: React.FC<ConditionsOverviewProps> = ({ patient }) => {
  const conditionsToShowCount = 5;
  const { t } = useTranslation();
  const [conditions, setConditions] = React.useState<Array<Condition>>(null);
  const [error, setError] = React.useState(null);
  const [firstRowIndex, setFirstRowIndex] = React.useState(0);
  const [currentPageSize, setCurrentPageSize] = React.useState(5);

  const displayText = t("conditions", "Conditions");
  const headerTitle = t("conditions", "Conditions");
  const previousPage = t("previousPage", "Previous page");
  const nextPage = t("nextPage", "Next Page");
  const itemPerPage = t("itemPerPage", "Item per page");

  React.useEffect(() => {
    if (patient) {
      const sub = performPatientConditionsSearch(
        patient.identifier[0].value
      ).subscribe((conditions) => {
        setConditions(conditions);
      }, setError);

      return () => sub.unsubscribe();
    }
  }, [patient]);

  const launchConditionsForm = React.useCallback(() => {
    openWorkspaceTab(ConditionsForm, t("conditionsForm", "Conditions form"));
  }, []);

  const headers = [
    {
      key: "display",
      header: t("activeConditions", "Active Conditions"),
    },
    {
      key: "onsetDateTime",
      header: t("since", "Since"),
    },
  ];

  const getRowItems = (rows: Array<Condition>) => {
    return rows
      .slice(firstRowIndex, firstRowIndex + currentPageSize)
      .map((row) => ({
        ...row,
        onsetDateTime: dayjs(row.onsetDateTime).format("MMM-YYYY"),
      }));
  };

  const RenderConditions: React.FC = () => {
    if (conditions.length) {
      const rows = getRowItems(conditions);
      const totalRows = conditions.length;
      return (
        <div>
          <div className={styles.conditionsHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
              {headerTitle}
            </h4>
            <Button
              kind="ghost"
              renderIcon={Add16}
              iconDescription="Add conditions"
              onClick={launchConditionsForm}
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
          {totalRows > conditionsToShowCount && (
            <Pagination
              totalItems={conditions.length}
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
        launchForm={launchConditionsForm}
      />
    );
  };

  return (
    <>
      {conditions ? (
        <RenderConditions />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={conditionsToShowCount} />
      )}
    </>
  );
};

export default ConditionsOverview;
