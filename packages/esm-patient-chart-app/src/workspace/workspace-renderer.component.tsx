import React, { useEffect, useState, useMemo } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import { OpenWorkspace, useWorkspaceWindowSize } from '@openmrs/esm-patient-common-lib';
import { mountRootParcel } from 'single-spa';
import Parcel from 'single-spa-react/parcel';
import Loader from '../loader/loader.component';
import styles from './workspace-window.scss';

interface WorkspaceRendererProps {
  workspace: OpenWorkspace;
  patientUuid: string;
  active: boolean;
}

export function WorkspaceRenderer({ workspace, patientUuid, active }: WorkspaceRendererProps) {
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { windowSize } = useWorkspaceWindowSize();
  const maximized = windowSize.size === 'maximized';
  const [lifecycle, setLifecycle] = useState();
  useEffect(() => {
    let active = true;
    workspace.load().then(({ default: result, ...lifecycle }) => {
      if (active) {
        setLifecycle(result ?? lifecycle);
      }
    });
    return () => {
      active = false;
    };
  }, [workspace]);

  const props = useMemo(
    () =>
      workspace && {
        closeWorkspace: workspace.closeWorkspace,
        promptBeforeClosing: workspace.promptBeforeClosing,
        patientUuid,
        ...workspace.additionalProps,
      },
    [workspace, patientUuid],
  );

  return (
    <div
      className={`${active ? styles.fixed : styles.hide} ${
        maximized && !isTablet ? styles.fullWidth : styles.dynamicWidth
      }`}
    >
      {lifecycle ? (
        <Parcel key={workspace.name} config={lifecycle} mountParcel={mountRootParcel} {...props} />
      ) : (
        <Loader />
      )}
    </div>
  );
}
