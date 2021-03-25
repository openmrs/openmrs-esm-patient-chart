import React, { useEffect } from "react";
import styles from "./tabbed-view.css";
import {
  ConfigurableLink,
  ExtensionInfo,
  ExtensionSlot,
  navigate,
  translateFrom,
  useExtensionStore,
} from "@openmrs/esm-framework";
import { useRouteMatch } from "react-router-dom";
import { DashboardTabConfig } from "../config-schemas";
import { useUrlData } from "../useUrlData";

function getTitle(ext: ExtensionInfo) {
  const title = ext.meta.title;

  if (typeof title === "string") {
    return title;
  } else if (title && typeof title === "object") {
    return translateFrom(
      ext.moduleName,
      ext.meta.title.key,
      ext.meta.title.default
    );
  }

  return ext.name;
}

function ShowTabs({
  slot,
  view,
  fullPath,
}: {
  slot: string;
  view: string;
  fullPath: string;
}) {
  const store = useExtensionStore();
  const extensions = React.useMemo(() => {
    const ids = store.slots[slot]?.attachedIds ?? [];
    return ids.map((id) => store.extensions[id]);
  }, [store]);
  const defaultExtension = extensions[0];

  useEffect(() => {
    if (!view && defaultExtension) {
      navigate({
        to: `${fullPath}/${defaultExtension.meta.view}`,
      });
    }
  }, [view, defaultExtension]);

  return (
    <ul>
      {view &&
        extensions.map((ext) => (
          <li key={ext.name}>
            <div
              className={`${
                ext.meta.view === view ? "selected" : "unselected"
              }`}
            >
              <ConfigurableLink to={`${fullPath}/${ext.meta.view}`}>
                <button className="omrs-unstyled">{getTitle(ext)}</button>
              </ConfigurableLink>
            </div>
          </li>
        ))}
    </ul>
  );
}

export interface TabbedViewProps {
  name: string;
  slot: string;
  patientUuid: string;
  layout: DashboardTabConfig;
}

interface RouteParams {
  subview: string;
}

export default function TabbedView({ name, slot, patientUuid }: TabbedViewProps) {
  const urlData = useUrlData();
  const { params } = useRouteMatch<RouteParams>();
  const fullPath = `${window.spaBase}${urlData.basePath}/${name}`;
  const view = params.subview;
  const state = {
    ...urlData,
    fullPath,
    patientUuid,
    view,
  };

  return (
    <>
      <nav className={styles.summariesnav} style={{ marginTop: "0" }}>
        <ShowTabs slot={slot} view={view} fullPath={fullPath} />
      </nav>
      <div className={styles.routesContainer}>
        {view && (
          <ExtensionSlot
            extensionSlotName={slot}
            state={state}
            select={(extensions) =>
              extensions.filter((ext) => ext.meta.view === view)
            }
          />
        )}
      </div>
    </>
  );
}
