import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { TaskAdd } from '@carbon/react/icons';
import { formEntrySub, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { ConfigurableProgram } from '../../types';

interface ProgramActionButton {
  enrollment: ConfigurableProgram;
}

const ProgramActionButton: React.FC<ProgramActionButton> = ({ enrollment }) => {
  const { t } = useTranslation();
  const formUuid =
    enrollment.enrollmentStatus === 'eligible' ? enrollment.enrollmentFormUuid : enrollment.discontinuationFormUuid;
  const launchEnrollmentForm = (enrollmentStatus: string) => {
    formEntrySub.next({ formUuid, encounterUuid: '' });
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: `${enrollment?.display} ${enrollmentStatus} Form`,
    });
  };

  if (enrollment.enrollmentStatus === 'eligible') {
    return (
      <Button
        onClick={() => launchEnrollmentForm(t('enrollment', 'Enrollment'))}
        renderIcon={(props) => <TaskAdd size={20} {...props} />}
        kind="tertiary"
        size="small"
      >
        {t('enroll', 'Enroll')}
      </Button>
    );
  }
  return (
    <Button
      onClick={() => launchEnrollmentForm(t('discontinue', 'Discontinue'))}
      renderIcon={(props) => <TaskAdd size={20} {...props} />}
      kind="danger--ghost"
      size="small"
    >
      {t('discontinue', 'Discontinue')}
    </Button>
  );
};

export default ProgramActionButton;
