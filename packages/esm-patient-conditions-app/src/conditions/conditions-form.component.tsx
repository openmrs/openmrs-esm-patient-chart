import React, { SyntheticEvent, useState } from 'react';
import 'dayjs/plugin/utc';
import styles from './conditions-form.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { Button, Form, ButtonSet } from 'carbon-components-react';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import ConditionsWidget from './conditions-widget.component';

const ConditionsForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [hasSubmissibleValue, setHasSubmissibleValue] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = React.useCallback((event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
  }, []);

  return (
    <Form className={styles.form} onSubmit={handleSubmit}>
      <ConditionsWidget
        patientUuid={patientUuid}
        isSubmitting={isSubmitting}
        closeWorkspace={closeWorkspace}
        setHasSubmissibleValue={setHasSubmissibleValue}
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
