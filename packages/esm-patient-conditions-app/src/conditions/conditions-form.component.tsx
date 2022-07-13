import React, { SyntheticEvent, useMemo } from 'react';
import 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { BehaviorSubject } from 'rxjs';
import { Button, Form, ButtonSet } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import ConditionsWidget from './conditions-widget.component';
import styles from './conditions-form.scss';

const ConditionsForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [hasSubmissibleValue, setHasSubmissibleValue] = React.useState(false);
  const submissionNotifier = useMemo(() => new BehaviorSubject<{ isSubmitting: boolean }>({ isSubmitting: false }), []);
  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      submissionNotifier.next({ isSubmitting: true });
    },
    [submissionNotifier],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <ConditionsWidget
        patientUuid={patientUuid}
        closeWorkspace={closeWorkspace}
        setHasSubmissibleValue={setHasSubmissibleValue}
        submissionNotifier={submissionNotifier}
      />
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={!hasSubmissibleValue} kind="primary" type="submit">
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ConditionsForm;
