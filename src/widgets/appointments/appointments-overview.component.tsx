import React from "react";
import { getAppointments } from "./appointments.resource";
import { useCurrentPatient } from "@openmrs/esm-api";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardFooter from "../cards/summary-card-footer.component";
import styles from "./appointments-overview.css";
export default function AppointmentsOverview() {
  const [patientAppointments, setPatientAppointments] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const startDate = dayjs().format();
  React.useEffect(() => {
    const abortController = new AbortController();
    if (patientUuid) {
      getAppointments(
        patientUuid,
        startDate,
        abortController
      ).then((response: any) => setPatientAppointments(response.data));
    }
  }, [patientUuid]);
  function restAPIAppointmentsOverview() {
    return (
      <SummaryCard
        name="Appointments"
        styles={{ margin: "1.25rem, 1.5rem", width: "100%" }}
      >
        <table className={styles.tableAppointments}>
          <thead>
            <tr className={styles.tableAppointmentsRow}>
              <th
                className={`${styles.tableAppointmentsHeader} ${styles.tableDates}`}
              >
                Date
              </th>
              <th className={styles.tableAppointmentsHeader}>
                Service Name, Status
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {patientAppointments &&
              patientAppointments.slice(0, 5).map(appointment => (
                <tr
                  key={appointment.uuid}
                  className={styles.tableAppointmentsRow}
                >
                  <td test-id="startDate">
                    {dayjs(appointment.startDateTime).format("YY:MM:DD")}
                  </td>
                  <td>
                    {appointment.service.name}
                    <div className={styles.status}>{appointment.status}</div>
                  </td>
                  <td
                    className={styles.tdLowerSvg}
                    style={{ textAlign: "end" }}
                  >
                    <svg
                      className="omrs-icon"
                      fill="var(--omrs-color-ink-low-contrast)"
                    >
                      <use xlinkHref="#omrs-icon-chevron-right" />
                    </svg>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <SummaryCardFooter
          linkTo={`/patient/${patientUuid}/chart/appointments`}
        />
      </SummaryCard>
    );
  }

  return restAPIAppointmentsOverview();
}
