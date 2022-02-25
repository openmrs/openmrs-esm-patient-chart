import React, { useEffect } from 'react';
import styles from './tabbed-view.css';
import {
  ConfigurableLink,
  ExtensionSlot,
  navigate,
  useAssignedExtensions,
  translateFrom,
  ExtensionRegistration,
  AssignedExtension,
} from '@openmrs/esm-framework';
import { useRouteMatch } from 'react-router-dom';
import { DashboardTabConfig } from '../config-schemas';
import { basePath } from '../constants';

interface ShowTabsProps {
  slot: string;
  view: string;
  fullPath: string;
}

const ShowTabs: React.FC<ShowTabsProps> = ({ slot, view, fullPath }) => {
  const extensions = useAssignedExtensions(slot);
  const defaultExtension = extensions[0];

  useEffect(() => {
    if (!view && defaultExtension) {
      navigate({
        to: `${fullPath}/${defaultExtension.meta.view}`,
      });
    }
  }, [view, defaultExtension, fullPath]);

  return (
    <ul>
      {view &&
        extensions.map((extension) => {
          return (
            <li key={`${fullPath}-tab-${extension.id}`}>
              <div className={`${extension.meta.view === view ? 'selected' : 'unselected'}`}>
                <ConfigurableLink to={`${fullPath}/${extension.meta.view}`}>
                  <button className="omrs-unstyled">{getTitle(extension)}</button>
                </ConfigurableLink>
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export interface TabbedViewProps {
  name: string;
  slot: string;
  patientUuid: string;
  patient: fhir.Patient;
  tab: string;
  layout: DashboardTabConfig;
}

const TabbedView: React.FC<TabbedViewProps> = ({ name, slot, patient, patientUuid, tab }) => {
  const { url } = useRouteMatch(basePath);
  const fullPath = `${window.spaBase}${url}/${name}`;
  const state = React.useMemo(
    () => ({
      basePath: url,
      fullPath,
      patientUuid,
      patient,
      view: tab,
    }),
    [patientUuid, patient, tab, fullPath, url],
  );

  return (
    <>
      <nav className={styles.summariesnav}>
        <ShowTabs slot={slot} view={tab} fullPath={fullPath} />
      </nav>
      <ExtensionSlot
        className={styles.routesContainer}
        extensionSlotName={slot}
        state={state}
        select={(extensions) => extensions.filter((ext) => ext.meta.view === tab)}
      />
    </>
  );
};

function getTitle(ext: AssignedExtension) {
  const title = ext?.meta?.title;
  if (typeof title === 'string') {
    return title;
  } else if (title && typeof title === 'object') {
    return translateFrom(ext.moduleName, title.key, title.default);
  }
  return ext.name;
}

export default TabbedView;
