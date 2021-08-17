import React from 'react';
import Button from 'carbon-components-react/es/components/Button';
import Tab from 'carbon-components-react/es/components/Tab';
import Tabs from 'carbon-components-react/es/components/Tabs';
import { useTranslation } from 'react-i18next';
import { attach, ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import tail from 'lodash-es/tail';
import EmptyDataIllustration from '../empty-state/empty-data-illustration.component';
import styles from './clinical-view-overview.component.scss';
import { clearWorkspace } from '../clear-workspace';

interface ClinicalViewOverviewProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const ClinicalViewOverview: React.FC<ClinicalViewOverviewProps> = ({ patientUuid, patient }) => {
  const config = useConfig();
  const { t } = useTranslation();
  const [selectedViewIndex, setSelectedViewIndex] = React.useState(0);

  const state = React.useMemo(() => {
    return { patient, patientUuid };
  }, [patient, patientUuid]);

  const launchClinicalViewForm = React.useCallback(() => {
    clearWorkspace('patient-chart-workspace-slot');
    attach('patient-chart-workspace-slot', 'patient-clinical-view-form-workspace');
    setSelectedViewIndex(0);
  }, []);

  return (
    <div className={styles.clinicalViewContainer}>
      <div className={styles.clinicalViewHeaderContainer}>
        <span className={styles.title}>{t('clinicalViews', 'Clinical Views')}</span>
        <Button kind="ghost" onClick={launchClinicalViewForm}>
          {selectedViewIndex === 0 ? t('addView', 'Add View') : t('editView', 'Edit View')}
        </Button>
      </div>
      <div>
        <Tabs
          scrollIntoView={false}
          type="container"
          className={styles.tabsContentClass}
          tabContentClassName={styles.tabContentClassName}
          onSelectionChange={(event) => setSelectedViewIndex(event)}>
          {config.clinicalViews.map((tab, index) => (
            <Tab key={index} id={tab.slot} label={tab.slot}>
              {selectedViewIndex !== 0 ? (
                <ExtensionSlot extensionSlotName={tab.slotName} state={state} />
              ) : (
                <>
                  {config?.clinicalViews.length > 1 ? (
                    tail(config.clinicalViews).map((tab: any, index) => (
                      <ExtensionSlot key={tab.slot} extensionSlotName={tab.slotName} state={state} />
                    ))
                  ) : (
                    <div className={styles.emptyIllustrationContainer}>
                      <EmptyDataIllustration />
                      <p className={styles.content}>
                        {t('noClinicalViewsConfigured', 'Sorry, no clinical views configured')}
                      </p>
                      <Button onClick={launchClinicalViewForm} kind={'ghost'} className={styles.action}>
                        {t('clinicalViewConfigure', 'Try adding clinical views by clicking here')}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicalViewOverview;
