import React from "react";
import { Tabs, Panel } from "../widgets/tabs/tabs.component";
import { getNewWorkspaceItem, WorkspaceTab } from "./workspace.resource";

export default function Workspace(props: any) {
  const [openTabs, setOpenTabs] = React.useState<WorkspaceTab[]>([]);
  const [selectedTab, setSelectedTab] = React.useState();

  React.useEffect(() => {
    const sub = getNewWorkspaceItem().subscribe(item => {
      const updatedOpenTabs = [...openTabs, item];
      setOpenTabs(updatedOpenTabs);
      setSelectedTab(updatedOpenTabs.length - 1);
    });
    return () => sub.unsubscribe();
  });

  React.useEffect(() => {
    openTabs.length ? props.showWorkspace(true) : props.showWorkspace(false);
  }, [openTabs, props]);

  function removeTab(index) {
    const tab = openTabs[index];
    let userConfirmed = false;
    if (tab.inProgress) {
      userConfirmed = confirm(
        "There is ongoing work, are you sure you want to close this tab?"
      );
    }
    if (userConfirmed || !tab.inProgress) {
      const updatedOpenTabs = openTabs.slice();
      updatedOpenTabs.splice(index, 1);
      setOpenTabs(updatedOpenTabs);
      setSelectedTab(getSelectedTabAfterRemove(index, selectedTab));
    }
  }

  function getSelectedTabAfterRemove(removedItemIndex, currentTab) {
    if (removedItemIndex === currentTab) {
      return removedItemIndex > 0 ? removedItemIndex - 1 : null;
    } else if (removedItemIndex < currentTab) {
      return currentTab - 1;
    } else {
      return selectedTab;
    }
  }

  function setWorkBegan(index) {
    const updatedTabs = openTabs.slice();
    updatedTabs[index].inProgress = true;
    setOpenTabs(updatedTabs);
  }

  function setWorkEnded(index) {
    const updatedTabs = openTabs.slice();
    updatedTabs[index].inProgress = false;
    setOpenTabs(updatedTabs);
  }

  return (
    <>
      {openTabs.length && (
        <Tabs
          selected={selectedTab}
          setSelected={setSelectedTab}
          removeTab={removeTab}
        >
          {openTabs.map((tab, i) => (
            <Panel
              key={i}
              title={tab.name}
              style={selectedTab === i ? {} : { display: "none" }}
            >
              <tab.component
                {...tab.props}
                entryStarted={() => setWorkBegan(i)}
                entrySubmitted={() => setWorkEnded(i)}
                entryCancelled={() => setWorkEnded(i)}
              />
            </Panel>
          ))}
        </Tabs>
      )}
    </>
  );
}
