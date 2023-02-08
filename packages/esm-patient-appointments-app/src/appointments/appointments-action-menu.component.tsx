import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showModal } from '@openmrs/esm-framework';
import { Appointment } from '../types';
import styles from './appointments-action-menu.scss';

interface appointmentsActionMenuProps {
  appointment: Appointment;
}

export const AppointmentsActionMenu = ({ appointment }: appointmentsActionMenuProps) => {
  const { t } = useTranslation();

  const launchEditAppointmentForm = useCallback(
    () =>
      launchPatientWorkspace('appointments-form-workspace', {
        workspaceTitle: t('editAppointment', 'Edit an appointment'),
        appointment,
        context: 'editing',
      }),
    [appointment, t],
  );

  const launchCancelAppointmentDialog = () => {
    const dispose = showModal('appointment-cancel-confirmation-dialog', {
      closeCancelModal: () => dispose(),
      appointmentUuid: appointment.uuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu ariaLabel="Edit or delete appointment" size="sm" flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          id="editAppointment"
          onClick={launchEditAppointmentForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="cancelAppointment"
          itemText={t('cancel', 'Cancel')}
          onClick={launchCancelAppointmentDialog}
          isDelete={true}
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
