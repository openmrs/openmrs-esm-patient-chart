import React from 'react';
import { Button } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import TaskAdd20 from '@carbon/icons-react/es/task--add/20';
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
        renderIcon={TaskAdd20}
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
      renderIcon={TaskAdd20}
      kind="danger--ghost"
      size="small"
    >
      {t('discontinue', 'Discontinue')}
    </Button>
  );
};

export default ProgramActionButton;
