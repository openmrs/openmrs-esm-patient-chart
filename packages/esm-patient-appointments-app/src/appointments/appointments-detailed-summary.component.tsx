import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import styles from "./appointments-detailed-summary.css";
import AppointmentsForm from "./appointments-form.component";
import EmptyState from "./empty-state/empty-state.component";
import { createErrorHandler } from "@openmrs/esm-framework";
import { getAppointments } from "./appointments.resource";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

function openWorkspaceTab(_1: any, _2: any) {
  //TODO
}

interface AppointmentsDetailedSummaryProps {
  patientUuid: string;
}

export default function AppointmentsDetailedSummary({
  patientUuid
}: AppointmentsDetailedSummaryProps) {
  const [patientAppointments, setPatientAppointments] = useState([]);
  const { t } = useTranslation();
  const [startDate] = useState(dayjs().format());

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      getAppointments(patientUuid, startDate, abortController).then(
        ({ data }) => setPatientAppointments(data),
        createErrorHandler()
      );
      return () => abortController.abort();
    }
  }, [patientUuid, startDate]);

  return (
    <>
      {patientAppointments?.length ? (
        <SummaryCard
          name={t("appointments", "Appointments")}
          showComponent={() =>
            openWorkspaceTab(
              AppointmentsForm,
              `${t("appointmentsForm", "Appointments Form")}`
            )
          }
          addComponent={AppointmentsForm}
        >
          <table className={styles.appointmentDetailedSummaryTable}>
            <thead>
              <tr>
                <td>
                  <Trans i18nKey="date">Date</Trans>
                </td>
                <td>
                  <Trans i18nKey="startTime">Start time</Trans>
                </td>
                <td>
                  <Trans i18nKey="endTime">End time</Trans>
                </td>
                <td>
                  <Trans i18nKey="serviceType">Service type</Trans>
                </td>
                <td>
                  <Trans i18nKey="appointmentType">Appointment type</Trans>
                </td>
                <td colSpan={2}>
                  <Trans i18nKey="status">Status</Trans>
                </td>
              </tr>
            </thead>
            <tbody>
              {patientAppointments?.map(appointment => {
                return (
                  <tr key={appointment?.uuid}>
                    <td>
                      {dayjs
                        .utc(appointment?.startDateTime)
                        .format("YYYY-MMM-DD")}
                    </td>
                    <td>
                      {dayjs.utc(appointment?.startDateTime).format("HH:mm A")}
                    </td>
                    <td>
                      {dayjs.utc(appointment?.endDateTime).format("HH:mm A")}
                    </td>
                    <td>{appointment?.serviceType?.name}</td>
                    <td>{appointment?.appointmentKind}</td>
                    <td>{appointment?.status}</td>
                    <td>
                      <Link to={`/${appointment?.uuid}`}>
                        <svg
                          className="omrs-icon"
                          fill="var(--omrs-color-ink-low-contrast)"
                        >
                          <use xlinkHref="#omrs-icon-chevron-right" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SummaryCard>
      ) : (
        <EmptyState
          displayText={t("appointments", "appointments")}
          headerTitle={t("appointments", "Appointments")}
          launchForm={() =>
            openWorkspaceTab(
              AppointmentsForm,
              `${t("appointmentsForm", "Appointments Form")}`
            )
          }
        />
      )}
    </>
  );
}
