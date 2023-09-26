import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { TaskAdd } from '@carbon/react/icons';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { ConfigurableProgram } from '../../types';
import { useLayoutType } from '@openmrs/esm-framework';

interface ProgramActionButton {
  enrollment: ConfigurableProgram;
}

const ProgramActionButton: React.FC<ProgramActionButton> = ({ enrollment }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const formUuid =
    enrollment.enrollmentStatus === 'eligible' ? enrollment.enrollmentFormUuid : enrollment.discontinuationFormUuid;
  const launchEnrollmentForm = (enrollmentStatus: string) => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: `${enrollment?.display} ${enrollmentStatus} Form`,
      formInfo: { formUuid, encounterUuid: '' },
    });
  };

  if (enrollment.enrollmentStatus === 'eligible') {
    return (
      <Button
        iconDescription={t('enrollProgram', 'Enroll to program')}
        onClick={() => launchEnrollmentForm(t('enrollment', 'Enrollment'))}
        renderIcon={(props) => <TaskAdd size={20} {...props} />}
        kind="tertiary"
        size={isTablet ? 'lg' : 'sm'}
        tooltipPosition="left"
      >
        {t('enroll', 'Enroll')}
      </Button>
    );
  }

  return (
    <Button
      iconDescription={t('discontinueEnrollment', 'Discontinue enrollment')}
      onClick={() => launchEnrollmentForm(t('discontinue', 'Discontinue'))}
      renderIcon={(props) => <TaskAdd size={20} {...props} />}
      kind="danger--ghost"
      size={isTablet ? 'lg' : 'sm'}
      tooltipPosition="left"
    >
      {t('discontinue', 'Discontinue')}
    </Button>
  );
};

export default ProgramActionButton;
