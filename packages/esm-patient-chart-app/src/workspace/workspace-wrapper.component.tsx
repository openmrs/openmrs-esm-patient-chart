import React from "react";
import Workspace from "./workspace.component";
import styles from "./workspace-wrapper.component.css";
import { WorkspaceItem, getNewWorkspaceItem } from "@openmrs/esm-framework";

export default function WorkspaceWrapper(props: any) {
  const [showWorkspace, setShowWorkspace] = React.useState(false);
  const [toggleMobileTableView, setToggleMobileTabletView] = React.useState<
    Boolean
  >(window.innerWidth <= 1200);
  const [openTabs, setOpenTabs] = React.useState<WorkspaceItem[]>([]);
  const [selectedTab, setSelectedTab] = React.useState(null);

  React.useEffect(() => {
    const sub = getNewWorkspaceItem().subscribe(item => {
      if (item.validations) {
        const validation = item.validations(openTabs);
        if (validation > -1) {
          setSelectedTab(validation);
        } else {
          const updatedOpenTabs = [...openTabs, item];
          setOpenTabs(updatedOpenTabs);
          setSelectedTab(updatedOpenTabs.length - 1);
        }
      } else {
        const updatedOpenTabs = [...openTabs, item];
        setOpenTabs(updatedOpenTabs);
        setSelectedTab(updatedOpenTabs.length - 1);
      }
    });
    return () => sub.unsubscribe();
  });

  React.useEffect(() => {
    setToggleMobileTabletView(false);
  }, [openTabs]);

  function toggleMobileAndTabletNavBar() {
    return (
      <div className={styles.tabletAndMobileTabs}>
        {toggleMobileTableView ? (
          <button
            className="omrs-btn-icon-medium"
            onClick={() => {
              setToggleMobileTabletView(!toggleMobileTableView);
            }}
          >
            <svg>
              <use xlinkHref="#omrs-icon-arrow-back"></use>
            </svg>
          </button>
        ) : (
          <button
            className="omrs-btn-icon-medium"
            onClick={() => {
              setToggleMobileTabletView(!toggleMobileTableView);
            }}
          >
            <svg>
              <use xlinkHref="#omrs-icon-arrow-forward"></use>
            </svg>
          </button>
        )}
        {toggleMobileTableView &&
          openTabs.map(tab => {
            return (
              <button
                key={tab.name}
                className="omrs-btn-icon-medium"
                onClick={() => {
                  if (openTabs.length) {
                    setToggleMobileTabletView(!toggleMobileTableView);
                  } else {
                    setToggleMobileTabletView(toggleMobileTableView);
                  }
                }}
              >
                {tab.name.charAt(0)}
              </button>
            );
          })}
      </div>
    );
  }

  return (
    <div
      style={{ ...props.style }}
      className={`${styles.workspace} ${
        showWorkspace ? styles.visible : styles.invisible
      } ${toggleMobileTableView ? styles.halfWidth : styles.fullWidth}`}
    >
      {toggleMobileAndTabletNavBar()}
      <div className={toggleMobileTableView ? styles.hide : styles.fullWidth}>
        <Workspace showWorkspace={setShowWorkspace} openTabs={setOpenTabs} />
      </div>
    </div>
  );
}
