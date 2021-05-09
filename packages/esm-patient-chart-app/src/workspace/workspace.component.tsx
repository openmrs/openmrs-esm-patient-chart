import React from 'react';
import { getNewWorkspaceItem, WorkspaceItem } from '@openmrs/esm-framework';
import { Panel, Tabs } from './tabs.component';

interface WorkspaceProps {
  patientUuid: string;
  patient: fhir.Patient;
  openTabs(items: Array<WorkspaceItem>): void;
  showWorkspace(value: boolean): void;
}

const Workspace: React.FC<WorkspaceProps> = (props) => {
  const [openTabs, setOpenTabs] = React.useState<Array<WorkspaceItem>>([]);
  const [selectedTab, setSelectedTab] = React.useState(null);

  React.useEffect(() => {
    const sub = getNewWorkspaceItem().subscribe((item) => {
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
  }, [openTabs]);

  React.useEffect(() => props.showWorkspace(openTabs.length > 0), [openTabs.length, props.showWorkspace]);

  const getSelectedTabAfterRemove = React.useCallback(
    (removedItemIndex: number, currentTab: number) => {
      if (removedItemIndex === currentTab) {
        return removedItemIndex > 0 ? removedItemIndex - 1 : null;
      } else if (removedItemIndex < currentTab) {
        return currentTab - 1;
      } else {
        return selectedTab;
      }
    },
    [selectedTab],
  );

  const removeTab = React.useCallback(
    (index: number) => {
      const tab = openTabs[index];
      let userConfirmed = false;

      if (tab.inProgress) {
        userConfirmed = confirm('There is ongoing work, are you sure you want to close this tab?');
      }

      if (userConfirmed || !tab.inProgress) {
        const updatedOpenTabs = openTabs.slice();
        updatedOpenTabs.splice(index, 1);
        setOpenTabs(updatedOpenTabs);
        setSelectedTab(getSelectedTabAfterRemove(index, selectedTab));
        props.openTabs(updatedOpenTabs);
      }
    },
    [props.openTabs, openTabs, selectedTab, getSelectedTabAfterRemove],
  );

  const setWorkBegan = React.useCallback(
    (index: number) => {
      const updatedTabs = openTabs.slice();
      updatedTabs[index].inProgress = true;
      setOpenTabs(updatedTabs);
    },
    [openTabs],
  );

  const setWorkEnded = React.useCallback(
    (index: number) => {
      const updatedTabs = openTabs.slice();
      updatedTabs[index].inProgress = false;
      setOpenTabs(updatedTabs);
    },
    [openTabs],
  );

  const onCloseTabRequest = React.useCallback(
    (index: number, tab: WorkspaceItem) => {
      setWorkEnded(index);
      removeTab(index);

      if (tab.componentClosed) {
        tab.componentClosed();
      }
    },
    [setWorkEnded, removeTab],
  );

  return (
    <>
      {openTabs.length && (
        <Tabs selected={selectedTab} setSelected={setSelectedTab} removeTab={removeTab}>
          {openTabs.map((tab, i) => {
            return (
              <Panel key={i} title={tab.name} style={selectedTab === i ? {} : { display: 'none' }}>
                <tab.component
                  {...tab.props}
                  patientUuid={props.patientUuid}
                  patient={props.patient}
                  entryStarted={() => setWorkBegan(i)}
                  entrySubmitted={() => setWorkEnded(i)}
                  entryCancelled={() => setWorkEnded(i)}
                  closeComponent={() => onCloseTabRequest(i, tab)}
                />
              </Panel>
            );
          })}
        </Tabs>
      )}
    </>
  );
};

export default Workspace;
