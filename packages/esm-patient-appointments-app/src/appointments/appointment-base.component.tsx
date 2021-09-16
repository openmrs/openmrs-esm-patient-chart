import React, { useState } from 'react';
import styles from './appointment-base.component.scss';
import Add16 from '@carbon/icons-react/es/add/16';
import AppointmentTable from './appointment-table.component';
import { Button, DataTableSkeleton, ContentSwitcher, Switch } from 'carbon-components-react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useAppointments } from '../hooks/useAppointments';
import { attach } from '@openmrs/esm-framework';

interface AppointmentBaseProps {
  basePath?: string;
  patientUuid: string;
}

const AppointmentBase: React.FC<AppointmentBaseProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [appointmentToDisplay, setAppointmentToDisplay] = useState(0);
  const { upcomingAppointments, pastAppointments, error, status, patientAppointments } = useAppointments(patientUuid);
  const headerTitle = t('appointments', 'Appointments');

  const launchAppointmentsForm = () => {
    attach('patient-chart-workspace-slot', 'appointment-form-workspace');
  };

  return (
    <>
      <>
        {status === 'pending' && <DataTableSkeleton rowCount={5} />}
        {status === 'resolved' && (
          <>
            {patientAppointments.length > 0 ? (
              <div className={styles.card}>
                <div className={styles.appointmentHeader}>
                  <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
                  <div className={styles.contentSwitcherWrapper}>
                    <ContentSwitcher size="md" onChange={({ index }) => setAppointmentToDisplay(index)}>
                      <Switch name={'upcoming'} text={t('upcoming', 'Upcoming')} />
                      <Switch name={'second'} text={t('past', 'Past')} />
                    </ContentSwitcher>
                    <div className={styles.divider}></div>
                    <Button
                      kind="ghost"
                      renderIcon={Add16}
                      iconDescription="Add Appointments"
                      onClick={launchAppointmentsForm}>
                      {t('add', 'Add')}
                    </Button>
                  </div>
                </div>

                {appointmentToDisplay === 0 && <AppointmentTable patientAppointments={upcomingAppointments} />}
                {appointmentToDisplay === 1 && <AppointmentTable patientAppointments={pastAppointments} />}
              </div>
            ) : (
              <EmptyState
                launchForm={launchAppointmentsForm}
                displayText={t('appointments', 'Appointments')}
                headerTitle={t('appointments', 'Appointments')}
              />
            )}
          </>
        )}
        {status === 'error' && <ErrorState headerTitle={headerTitle} error={error} />}
      </>
    </>
  );
};

export default AppointmentBase;
