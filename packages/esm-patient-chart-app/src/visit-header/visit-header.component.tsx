import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header, HeaderGlobalAction, HeaderGlobalBar, HeaderMenuButton, Button } from '@carbon/react';
import { CloseFilled } from '@carbon/react/icons';
import { useAssignedExtensions, useLayoutType, usePatient, useVisit, navigate } from '@openmrs/esm-framework';

import VisitHeaderSideMenu from './side-menu/visit-header-side-menu.component';
import RetrospectiveVisitLabel from './retrospective-visit-label.component';
import PatientInfo from './patient-info/patient-info.component';
import VisitHeaderLink from './visit-header-link/visit-header-link.component';
import VisitHeaderExtensions from './visit-header-extensions/visit-header-extensions.component';
import styles from './visit-header.scss';
import QueueEntryLabel from './queue-entry-label/queue-entry-label.component';
import { useVisitQueueEntry } from '../visit/queue-entry/queue.resource';
import CurrentVisitLabel from './current-visit-label/current-visit-label.component';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

const VisitHeader: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const { currentVisit, currentVisitIsRetrospective, isValidating } = useVisit(patient?.id);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);

  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);
  const showHamburger = useLayoutType() !== 'large-desktop' && navMenuItems.length > 0;
  const { queueEntry } = useVisitQueueEntry(patient?.id, currentVisit?.uuid);
  const isLoading = isValidating && currentVisit === null;
  const visitNotLoaded = !isValidating && currentVisit === null;
  const hasActiveVisit = !isLoading && !visitNotLoaded;
  const isDeceased = Boolean(patient?.deceasedDateTime);
  const toggleSideMenu = useCallback(() => setIsSideMenuExpanded((prevState) => !prevState), []);
  const layout = useLayoutType();
  const onClosePatientChart = useCallback(() => {
    document.referrer === '' ? navigate({ to: `${window.spaBase}/home` }) : window.history.back();
  }, []);

  if (!patient?.id) {
    return null;
  }

  const layoutStyles = {
    'large-desktop': [styles.desktopLayout],
    'small-desktop': [styles.smallDesktopLayout],
  };

  return (
    <Header aria-label="OpenMRS" className={layoutStyles[layout]}>
      {showHamburger && (
        <HeaderMenuButton
          aria-label="Open menu"
          isCollapsible
          className={styles.headerMenuButton}
          onClick={(event) => {
            event.stopPropagation();
            toggleSideMenu();
          }}
          isActive={isSideMenuExpanded}
        />
      )}
      <VisitHeaderLink />
      {patient && <PatientInfo patient={patient} />}
      {queueEntry && <QueueEntryLabel queueEntry={queueEntry} />}
      {currentVisitIsRetrospective && <RetrospectiveVisitLabel currentVisit={currentVisit} />}
      {queueEntry && currentVisit && <CurrentVisitLabel queueEntry={queueEntry} currentVisit={currentVisit} />}
      <HeaderGlobalBar className={styles.lastItem}>
        <VisitHeaderExtensions />
        {!hasActiveVisit && !isDeceased && (
          <Button
            className={styles.startVisitButton}
            onClick={() => launchPatientWorkspace('start-visit-workspace-form')}
            size="lg"
          >
            {t('startAVisit', 'Start a visit')}
          </Button>
        )}
        <HeaderGlobalAction
          className={styles.headerGlobalBarCloseButton}
          aria-label={t('close', 'Close')}
          onClick={onClosePatientChart}
        >
          <CloseFilled size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
      <VisitHeaderSideMenu isExpanded={isSideMenuExpanded} toggleSideMenu={toggleSideMenu} />
    </Header>
  );
};

export default VisitHeader;
