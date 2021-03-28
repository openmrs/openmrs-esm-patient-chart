import React from "react";
import dayjs from "dayjs";
import styles from "./appointments-overview.scss";
import Add16 from "@carbon/icons-react/es/add/16";
import EmptyState from "./empty-state/empty-state.component";
import ErrorState from "./error-state/error-state.component";
import AppointmentsForm from "./appointments-form.component";
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
import { useTranslation } from "react-i18next";
import { getAppointments } from "./appointments.resource";
import { openWorkspaceTab } from "./openWorkspaceTab";

interface AppointmentOverviewProps {
  basePath: string;
  patientUuid: string;
}

const AppointmentsOverview: React.FC<AppointmentOverviewProps> = ({
  patientUuid
}) => {
  const { t } = useTranslation();
  const appointmentsToShowCount = 5;
  const [appointments, setAppointments] = React.useState(null);
  const [error, setError] = React.useState(null);
  const startDate = dayjs().format();
  const displayText = t("appointments", "appointments");
  const headerTitle = t("appointments", "Appointments");

  React.useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();

      getAppointments(patientUuid, startDate, abortController)
        .then(({ data }) => setAppointments(data))
        .catch(setError);

      return () => abortController.abort();
    }
  }, [patientUuid, startDate]);

  const launchAppointmentsForm = () => {
    openWorkspaceTab(
      AppointmentsForm,
      t("appointmentsForm", "Appointments form")
    );
  };

  const headers = [
    {
      key: "name",
      header: t("serviceType", "Service Type")
    },
    {
      key: "startDateTime",
      header: t("date", "Date")
    },
    {
      key: "status",
      header: t("status", "Status")
    }
  ];

  const getRowItems = rows =>
    rows.map(row => ({
      id: row.uuid,
      name: row.service?.name,
      startDateTime: dayjs.utc(row.startDateTime).format("DD-MMM-YYYY"),
      status: row.status
    }));

  const RenderAppointments: React.FC = () => {
    if (appointments.length) {
      const rows = getRowItems(appointments);
      return (
        <div>
          <div className={styles.allergiesHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
              {headerTitle}
            </h4>
            <Button
              kind="ghost"
              renderIcon={Add16}
              iconDescription="Add appointments"
              onClick={launchAppointmentsForm}
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
                  </TableBody>
                </Table>
              )}
            </DataTable>
          </TableContainer>
        </div>
      );
    }
    return (
      <EmptyState
        displayText={displayText}
        headerTitle={headerTitle}
        launchForm={launchAppointmentsForm}
      />
    );
  };

  return (
    <>
      {appointments ? (
        <RenderAppointments />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={appointmentsToShowCount} />
      )}
    </>
  );
};

export default AppointmentsOverview;
