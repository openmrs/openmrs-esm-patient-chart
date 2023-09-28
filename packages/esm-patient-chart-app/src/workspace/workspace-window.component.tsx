import React, { useMemo } from 'react';
import { ExtensionSlot, useBodyScrollLock, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { type OpenWorkspace, useWorkspaces, updateWorkspaceWindowState } from '@openmrs/esm-patient-common-lib';
import { Header, HeaderGlobalBar, HeaderName, IconButton } from '@carbon/react';
import { ArrowLeft, ArrowRight, Close, DownToBottom, Maximize, Minimize } from '@carbon/react/icons';
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
  const { active, workspaces, workspaceWindowState } = useWorkspaces();
  const hidden = workspaceWindowState === 'hidden';
  const maximized = workspaceWindowState === 'maximized';

  const isWorkspaceWindowOpen = active && !hidden;

  useBodyScrollLock(active && !isDesktop(layout));

  const toggleWindowState = () => {
    maximized ? updateWorkspaceWindowState('normal') : updateWorkspaceWindowState('maximized');
  };

  const workspacesToRender = useMemo(() => {
    return workspaces.map((w, idx) => (
      <WorkspaceRenderer key={w.name} workspace={w} patientUuid={patientUuid} active={idx === 0} />
    ));
  }, [workspaces, patientUuid]);

  const workspaceTitle = workspaces[0]?.additionalProps?.['workspaceTitle'] ?? workspaces[0]?.title ?? '';
  const {
    canHide = false,
    canMaximize = false,
    width = 'narrow',
    closeWorkspace = () => {},
  } = useMemo(() => workspaces?.[0] ?? ({} as OpenWorkspace), [workspaces]);

  return (
    <aside
      className={`${styles.container} ${width === 'narrow' ? styles.narrowWorkspace : styles.widerWorkspace} ${
        maximized ? `${styles.maximized}` : undefined
      } ${
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
        {layout === 'tablet' && !canHide && (
          <IconButton align="bottom-right" onClick={closeWorkspace}>
            <ArrowLeft />
          </IconButton>
        )}
        <HeaderName prefix="">{workspaceTitle}</HeaderName>
        <HeaderGlobalBar className={styles.headerGlobalBar}>
          <ExtensionSlot name={patientChartWorkspaceHeaderSlot} />
          {isDesktop(layout) && (
            <>
              {canMaximize && (
                <IconButton
                  align="bottom"
                  kind="ghost"
                  label={maximized ? t('minimize', 'Minimize') : t('maximize', 'Maximize')}
                  onClick={toggleWindowState}
                  size="lg"
                >
                  {maximized ? <Maximize /> : <Minimize />}
                </IconButton>
              )}
              {canHide ? (
                <IconButton
                  align="bottom-right"
                  kind="ghost"
                  label={t('hide', 'Hide')}
                  onClick={() => updateWorkspaceWindowState('hidden')}
                  size="lg"
                >
                  <ArrowRight />
                </IconButton>
              ) : (
                <IconButton
                  align="bottom-right"
                  label={t('close', 'Close')}
                  kind="ghost"
                  onClick={() => closeWorkspace?.()}
                  size="lg"
                >
                  <Close />
                </IconButton>
              )}
            </>
          )}
          {layout === 'tablet' && canHide && (
            <IconButton
              align="bottom-right"
              label={t('close', 'Close')}
              kind="ghost"
              onClick={() => closeWorkspace?.()}
            >
              <DownToBottom />
            </IconButton>
          )}
        </HeaderGlobalBar>
      </Header>
      {workspacesToRender}
    </aside>
  );
};

export default WorkspaceWindow;
