import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { CardHeader, EmptyDataIllustration, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { Button, DataTableSkeleton, ContentSwitcher, InlineLoading, Switch, Tile } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useAppointments } from './appointments.resource';
import AppointmentsTable from './appointments-table.component';
import styles from './appointments-base.scss';

interface AppointmentsBaseProps {
  basePath?: string;
  patientUuid: string;
}

enum AppointmentTypes {
  UPCOMING = 0,
  PAST = 1,
}

const AppointmentsBase: React.FC<AppointmentsBaseProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('appointments', 'Appointments');

  const [contentSwitcherValue, setContentSwitcherValue] = useState(0);
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const {
    data: appointmentsData,
    isError,
    isLoading,
    isValidating,
  } = useAppointments(patientUuid, startDate, new AbortController());

  const launchAppointmentsForm = () => launchPatientWorkspace('appointments-form-workspace');

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) {
    return <ErrorState headerTitle={headerTitle} error={isError} />;
  }
  if (Object.keys(appointmentsData)?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          {isValidating ? (
            <span>
              <InlineLoading />
            </span>
          ) : null}
          <div className={styles.contentSwitcherWrapper}>
            <ContentSwitcher size="md" onChange={({ index }) => setContentSwitcherValue(index)}>
              <Switch name={'upcoming'} text={t('upcoming', 'Upcoming')} />
              <Switch name={'past'} text={t('past', 'Past')} />
            </ContentSwitcher>
            <div className={styles.divider}></div>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add Appointments"
              onClick={launchAppointmentsForm}
            >
              {t('add', 'Add')}
            </Button>
          </div>
        </CardHeader>
        {(() => {
          if (contentSwitcherValue === AppointmentTypes.UPCOMING) {
            if (appointmentsData.upcomingAppointments?.length) {
              return <AppointmentsTable patientAppointments={appointmentsData?.upcomingAppointments} />;
            }
            return (
              <Tile className={styles.tile}>
                <EmptyDataIllustration />
                <p className={styles.content}>
                  {t('noUpcomingAppointments', 'There are no upcoming appointments to display for this patient')}
                </p>
              </Tile>
            );
          }
          if (contentSwitcherValue === AppointmentTypes.PAST) {
            if (appointmentsData.pastAppointments?.length) {
              return <AppointmentsTable patientAppointments={appointmentsData?.pastAppointments} />;
            }
            return (
              <Tile className={styles.tile}>
                <EmptyDataIllustration />
                <p className={styles.content}>
                  {t('noPastAppointments', 'There are no past appointments to display for this patient')}
                </p>
              </Tile>
            );
          }
        })()}
      </div>
    );
  }
};

export default AppointmentsBase;
