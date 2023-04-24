import React, { useEffect, useMemo, useState } from 'react';
import { ExtensionSlot, useBodyScrollLock, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { useWorkspaces, useWorkspaceWindowSize } from '@openmrs/esm-patient-common-lib';
import { Button, Header, HeaderGlobalBar, HeaderName } from '@carbon/react';
import { ArrowRight, DownToBottom, Maximize, Minimize } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { patientChartWorkspaceHeaderSlot } from '../constants';
import { isDesktop } from '../utils';
import { WorkspaceRenderer } from './workspace-renderer.component';
import styles from './workspace-window.scss';

interface ContextWorkspaceParams {
  patientUuid?: string;
}

const WorkspaceWindow: React.FC<ContextWorkspaceParams> = () => {
  const { patientUuid } = usePatient();
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { active, workspaces } = useWorkspaces();
  const { windowSize, updateWindowSize } = useWorkspaceWindowSize();
  const hidden = windowSize.size === 'hidden';
  const maximized = windowSize.size === 'maximized';
  const normal = windowSize.size === 'normal';

  const [isWorkspaceWindowOpen, setIsWorkspaceWindowOpen] = useState(false);

  useEffect(() => {
    if (active && (maximized || normal)) {
      setIsWorkspaceWindowOpen(true);
    } else if (workspaces.length && hidden) {
      setIsWorkspaceWindowOpen(false);
    } else {
      setIsWorkspaceWindowOpen(false);
    }
  }, [workspaces.length, active, hidden, maximized, normal]);

  useEffect(() => {
    if (active && hidden) {
      updateWindowSize('normal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, active]);

  useBodyScrollLock(active && !isDesktop(layout));

  const toggleWindowState = () => {
    maximized ? updateWindowSize('minimized') : updateWindowSize('maximized');
  };

  const workspacesToRender = useMemo(() => {
    return workspaces.map((w, idx) => (
      <WorkspaceRenderer key={w.name} workspace={w} patientUuid={patientUuid} active={idx === 0} />
    ));
  }, [workspaces, patientUuid]);

  const workspaceTitle = workspaces[0]?.additionalProps?.['workspaceTitle'] ?? workspaces[0]?.title ?? '';

  return (
    <aside
      className={`${styles.container} ${maximized ? `${styles.maximized}` : undefined} ${
        isWorkspaceWindowOpen
          ? `${styles.show}`
          : `${styles.hide}
      }`
      }`}
    >
      <Header
        aria-label="Workspace Title"
        className={`${styles.header} ${maximized ? `${styles.fullWidth}` : `${styles.dynamicWidth}`}`}
      >
        <HeaderName prefix="">{workspaceTitle}</HeaderName>
        <HeaderGlobalBar className={styles.headerGlobalBar}>
          <ExtensionSlot extensionSlotName={patientChartWorkspaceHeaderSlot} />
          {isDesktop(layout) && (
            <>
              <Button
                iconDescription={maximized ? t('minimize', 'Minimize') : t('maximize', 'Maximize')}
                hasIconOnly
                kind="ghost"
                onClick={toggleWindowState}
                renderIcon={(props) =>
                  maximized ? <Minimize size={16} {...props} /> : <Maximize size={16} {...props} />
                }
                tooltipPosition="bottom"
              />
              <Button
                iconDescription={t('hide', 'Hide')}
                hasIconOnly
                kind="ghost"
                onClick={() => updateWindowSize('hidden')}
                renderIcon={(props) => <ArrowRight size={16} {...props} />}
                tooltipPosition="bottom"
                tooltipAlignment="end"
              />
            </>
          )}
          {layout === 'tablet' && (
            <Button
              iconDescription={t('close', 'Close')}
              hasIconOnly
              onClick={() => workspaces[0]?.closeWorkspace()}
              renderIcon={(props) => <DownToBottom size={16} {...props} />}
              tooltipPosition="bottom"
              tooltipAlignment="end"
            />
          )}
        </HeaderGlobalBar>
      </Header>
      {workspacesToRender}
    </aside>
  );
};

export default WorkspaceWindow;
