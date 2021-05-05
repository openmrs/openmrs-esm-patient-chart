import React, { useState, useEffect } from 'react';
import AppointmentsForm from './appointments-form.component';
import dayjs from 'dayjs';
import styles from './appointment-record.css';
import { VerticalLabelValue, SummaryCard, RecordDetails, openWorkspaceTab } from '@openmrs/esm-patient-common-lib';
import { createErrorHandler } from '@openmrs/esm-framework';
import { RouteComponentProps } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { getAppointmentsByUuid } from './appointments.resource';
import { useAppointmentsContext } from './appointments.context';

export interface AppointmentRecordProps extends RouteComponentProps<{ appointmentUuid: string }> {}

export default function AppointmentRecord(props: AppointmentRecordProps) {
  const [patientAppointment, setPatientAppointment] = useState(null);
  const { patientUuid } = useAppointmentsContext();
  const { t } = useTranslation();
  const { appointmentUuid } = props.match.params;

  useEffect(() => {
    if (patientUuid && appointmentUuid) {
      const abortController = new AbortController();
      getAppointmentsByUuid(appointmentUuid, abortController)
        .then(({ data }) => setPatientAppointment(data))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [patientUuid, appointmentUuid]);

  return (
    <>
      {!!(patientAppointment && Object.entries(patientAppointment).length) && (
        <div className={styles.appointmentContainer}>
          <SummaryCard
            name={t('appointment', 'Appointment')}
            addComponent
            showComponent={() => openWorkspaceTab(AppointmentsForm, `${t('appointmentsForm', 'Appointment Form')}`)}>
            <table className={`omrs-type-body-regular ${styles.appointmentRecordTable}`}>
              <thead>
                <tr>
                  <td colSpan={3} style={{ fontSize: '2rem' }}>
                    {patientAppointment?.serviceType?.name}
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <VerticalLabelValue
                      label={t('date', 'Date')}
                      value={dayjs(patientAppointment?.startDateTime).format('YYYY-MMM-DD')}
                      valueStyles={{ fontFamily: 'Work Sans' }}
                    />
                  </td>
                  <td>
                    <VerticalLabelValue
                      label={t('startTime', 'Start time')}
                      value={dayjs.utc(patientAppointment?.startDateTime).format('HH:mm A')}
                    />
                  </td>
                  <td>
                    <VerticalLabelValue
                      label={t('endTime', 'End time')}
                      value={dayjs.utc(patientAppointment?.endDateTime).format('HH:mm A')}
                    />
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <VerticalLabelValue
                      label={t('comments', 'Comments')}
                      value={patientAppointment?.comments}
                      valueStyles={{ whiteSpace: 'pre-wrap' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <VerticalLabelValue
                      label={t('serviceType', 'Service type')}
                      value={patientAppointment?.serviceType?.name}
                    />
                  </td>
                  <td>
                    <VerticalLabelValue
                      label={t('appointmentType', 'Appointment type')}
                      value={patientAppointment?.appointmentKind}
                    />
                  </td>
                  <td>
                    <VerticalLabelValue label={t('status', 'Status')} value={patientAppointment?.status} />
                  </td>
                </tr>
              </tbody>
            </table>
          </SummaryCard>
          <RecordDetails>
            <table className={styles.appointmentRecordTable}>
              <thead className={styles.appointmentRecordTableHeader}>
                <tr>
                  <th>
                    <Trans i18nKey="lastUpdated">Last updated</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="lastUpdatedBy">Last updated by</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="lastUpdatedLocation">Last updated location</Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{dayjs(patientAppointment?.startDateTime).format('DD-MMM-YYYY')}</td>
                  <td>{patientAppointment?.service?.creatorName || '\u2014'}</td>
                  <td>{patientAppointment?.location ? patientAppointment?.location?.name : '\u2014'}</td>
                </tr>
              </tbody>
            </table>
          </RecordDetails>
        </div>
      )}
    </>
  );
}
