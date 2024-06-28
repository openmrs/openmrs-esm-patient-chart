import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toggle } from '@carbon/react';
import styles from './form-collapse-toggle.scss';

const FormCollapseToggle = () => {
  const { t } = useTranslation();
  const [isFormEmbedded, setIsFormEmbedded] = useState<boolean>(false);

  const handleFormEmbedded = useCallback((event) => {
    setIsFormEmbedded(event?.detail?.value || false);
  }, []);

  useEffect(() => {
    window.addEventListener('openmrs:form-view-embedded', handleFormEmbedded);

    return () => {
      window.removeEventListener('openmrs:form-view-embedded', handleFormEmbedded);
    };
  }, [handleFormEmbedded]);

  const handleOnToggle = (value: boolean) => {
    const FormCollapseToggleEvent = new CustomEvent('openmrs:form-collapse-toggle', { detail: { value } });
    window.dispatchEvent(FormCollapseToggleEvent);
  };

  if (!isFormEmbedded) {
    return null;
  }

  return (
    <div className={styles.toggleContainer}>
      <Toggle
        className={styles.toggle}
        size="sm"
        aria-label={t('toggleCollapseOrExpand', 'Toggle collapse or expand')}
        defaultToggled
        id="collapsable-toggle"
        labelA={t('expandAll', 'Expand all')}
        labelB={t('collapseAll', 'Collapse all')}
        onToggle={handleOnToggle}
      />
    </div>
  );
};

export default FormCollapseToggle;
