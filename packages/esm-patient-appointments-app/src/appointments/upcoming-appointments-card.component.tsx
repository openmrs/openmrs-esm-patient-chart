import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  InlineLoading,
  InlineNotification,
  StructuredListHead,
  StructuredListCell,
  StructuredListRow,
  StructuredListBody,
  StructuredListWrapper,
} from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { useAppointments } from './appointments.resource';
import { ErrorState } from '@openmrs/esm-patient-common-lib';

import styles from './upcoming-appointments-card.scss';
import dayjs from 'dayjs';
interface UpcomingAppointmentsProps {
  patientUuid: string;
  setUpcomingAppointment: (value: any) => void;
}

const UpcomingAppointmentsCard: React.FC<UpcomingAppointmentsProps> = ({ patientUuid, setUpcomingAppointment }) => {
  const { t } = useTranslation();
  const startDate = dayjs(new Date().setHours(0, 0, 0)).toISOString();
  const headerTitle = t('upcomingAppointments', 'Upcoming appointments');

  const ac = useMemo<AbortController>(() => new AbortController(), []);
  useEffect(() => () => ac.abort(), [ac]);
  const { data: appointmentsData, isError, isLoading } = useAppointments(patientUuid, startDate, ac);

  const todaysAppointments = appointmentsData?.todaysAppointments?.length ? appointmentsData?.todaysAppointments : [];
  const futureAppointments = appointmentsData?.upcomingAppointments?.length
    ? appointmentsData?.upcomingAppointments
    : [];
  const appointments = todaysAppointments.concat(futureAppointments)?.filter(({ status }) => status === 'Scheduled');

  useEffect(() => {
    if (appointments.length > 0) {
      setUpcomingAppointment(appointments[0]);
    }
  }, [appointments.length]);

  if (isError) {
    return <ErrorState headerTitle={headerTitle} error={isError} />;
  }
  if (isLoading) {
    <span>
      <InlineLoading />
    </span>;
  }

  if (appointments?.length) {
    const structuredListBodyRowGenerator = () => {
      return appointments.map((appointment, i) => (
        <StructuredListRow label key={`row-${i}`} className={styles.structuredList}>
          <StructuredListCell>{formatDate(parseDate(appointment.startDateTime), { mode: 'wide' })}</StructuredListCell>
          <StructuredListCell>{appointment.service ? appointment.service.name : '——'}</StructuredListCell>
          <StructuredListCell>
            <Checkbox
              className={styles.checkbox}
              key={i}
              labelText=""
              defaultChecked={dayjs(new Date(appointment.startDateTime).toISOString()).isToday() && i === 0}
              id={appointment.uuid}
              onChange={(e) => (e.target.checked ? setUpcomingAppointment(appointment) : '')}
            />
          </StructuredListCell>
        </StructuredListRow>
      ));
    };

    return (
      <div>
        <div>
          <p className={styles.sectionTitle}>{headerTitle}</p>
          <span className={styles.headerLabel}>
            {t('appointmentToCheckIn', 'Select appointment(s) to check in')}
          </span>{' '}
        </div>

        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('date', 'Date')}</StructuredListCell>
              <StructuredListCell head>{t('appointmentType', 'Appointment type')}</StructuredListCell>
              <StructuredListCell head>{t('action', 'Action')}</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>{structuredListBodyRowGenerator()}</StructuredListBody>
        </StructuredListWrapper>
      </div>
    );
  }
  return (
    <InlineNotification
      kind={'info'}
      lowContrast
      className={styles.inlineNotification}
      title={t('upcomingAppointments', 'Upcoming appointments')}
      subtitle={t('noUpcomingAppointments', 'No upcoming appointments found')}
    />
  );
};

export default UpcomingAppointmentsCard;
