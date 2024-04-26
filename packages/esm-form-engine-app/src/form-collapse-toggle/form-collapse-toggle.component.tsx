import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toggle } from '@carbon/react';
import styles from './styles.scss';

const FormCollapseToggle = () => {
  const { t } = useTranslation();
  const [isFormEmbedded, setIsFormEmbedded] = useState<boolean>(false);

  useEffect(() => {
    const handleFormEmbedded = (event) => {
      setIsFormEmbedded(event?.detail?.value || false);
    };

    window.addEventListener('openmrs:form-view-embedded', handleFormEmbedded);

    return () => {
      window.removeEventListener('openmrs:form-view-embedded', handleFormEmbedded);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('openmrs:form-collapse-toggle', null);

    return () => {
      window.removeEventListener('openmrs:form-collapse-toggle', null);
    };
  }, []);

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
