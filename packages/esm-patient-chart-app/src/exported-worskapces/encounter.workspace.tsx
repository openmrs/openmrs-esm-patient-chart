import React, { useEffect, useMemo, useState } from 'react';
import {
  type Encounter,
  ExtensionSlot,
  type ExportedWorkspaceWindowInfo,
  useWorkspace2Context,
  type Visit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  encounterWorkspaceSlotName,
  type EncounterWorkspaceSlotState,
  type PatientWorkspaceGroupProps,
} from '@openmrs/esm-patient-common-lib';
import VisitContextHeader from '../visit/visits-widget/visit-context/visit-context-header.extension';
import styles from './encounter.workspace.scss';

interface WindowProps {
  patient: fhir.Patient;
  visitContext: Visit;
  encounter?: Encounter;
  onEncounterSaved?: () => void;
  additionalProps?: Record<string, unknown>;
}

/**
 * Workspace to create or edit an encounter. The actual content is contributed by the apps that own
 * each kind of encounter, through extensions in the encounter workspace slot.
 */
const EncounterWorkspace: React.FC<Workspace2DefinitionProps<{}, WindowProps, {}>> = ({
  windowProps: { patient, visitContext, encounter, onEncounterSaved, additionalProps },
  closeWorkspace,
}) => {
  const { workspaceMeta } = useWorkspace2Context();
  const workspaceType = workspaceMeta?.type as string | undefined;

  const [exportedWorkspaceWindowInfo, setExportedWorkspaceWindowInfo] = useState<ExportedWorkspaceWindowInfo>(null);

  useEffect(() => {
    if (exportedWorkspaceWindowInfo && exportedWorkspaceWindowInfo.workspaceName == null) {
      closeWorkspace();
    }
  }, [exportedWorkspaceWindowInfo, closeWorkspace]);

  // Must be referentially stable: ExportedWorkspace re-seeds (resetting its title) whenever groupProps
  // changes shallowly, which fires onWindowChanged and re-renders this component.
  const groupProps: PatientWorkspaceGroupProps = useMemo(
    () => ({
      patient,
      patientUuid: patient.id,
      visitContext,
      mutateVisitContext: onEncounterSaved,
    }),
    [patient, visitContext, onEncounterSaved],
  );

  const slotState: EncounterWorkspaceSlotState = useMemo(
    () => ({
      workspaceType,
      encounter,
      additionalProps,
      onEncounterSaved,
      groupProps,
      onWindowChanged: setExportedWorkspaceWindowInfo,
    }),
    [workspaceType, encounter, additionalProps, onEncounterSaved, groupProps],
  );

  const isEditing = !!encounter;

  return (
    <Workspace2
      title={exportedWorkspaceWindowInfo?.title}
      hasUnsavedChanges={exportedWorkspaceWindowInfo?.hasUnsavedChanges}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <VisitContextHeader visitContext={visitContext} mode={isEditing ? 'edit' : 'create'} />
        </div>
        <div className={styles.content}>
          <ExtensionSlot
            name={encounterWorkspaceSlotName}
            state={slotState}
            // fallback={
            //     <div>
            //       {t('editingNotSupportedForEncounter', 'Editing is not supported for this encounter.')}
            //     </div>
            // }
          />
        </div>
      </div>
    </Workspace2>
  );
};

export default EncounterWorkspace;
