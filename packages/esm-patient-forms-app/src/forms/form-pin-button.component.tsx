import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { type Form } from '../types';
import { useFormPinToggle } from './useFormPinToggle';
import styles from './forms-table.scss';

interface FormPinButtonProps {
  form: Form;
  isTablet: boolean;
}

const FormPinButton: React.FC<FormPinButtonProps> = ({ form, isTablet }) => {
  const { t } = useTranslation();
  const { isPinned, isSaving, isLoading, isEnabled, toggle } = useFormPinToggle(form);

  if (!isEnabled) {
    return null;
  }

  if (isLoading || isSaving) {
    return <InlineLoading className={styles.pinLoading} />;
  }

  return (
    <IconButton
      kind="ghost"
      size={isTablet ? 'md' : 'sm'}
      label={isPinned ? t('removeFromPinnedForms', 'Remove from my pinned forms') : t('addToPinnedForms', 'Add to my pinned forms')}
      align="left"
      onClick={toggle}
      className={styles.pinButton}
    >
      {isPinned
        ? <PinFilled size={16} className={styles.pinIconActive} />
        : <Pin size={16} className={styles.pinIcon} />}
    </IconButton>
  );
};

export default FormPinButton;
