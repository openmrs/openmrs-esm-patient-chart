import React from 'react';
import {
  type DefaultPatientWorkspaceProps,
  type FormEntryProps,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import HtmlFormEntryWrapper from './html-form-entry-wrapper.component';
import { usePatient } from '@openmrs/esm-framework';

interface HtmlFormEntryComponentProps extends DefaultPatientWorkspaceProps {
  formInfo: FormEntryProps;
}

const HtmlFormEntry: React.FC<HtmlFormEntryComponentProps> = ({
  patientUuid,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  formInfo,
}) => {
  const { patient } = usePatient(patientUuid);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { encounterUuid, visitUuid, htmlForm } = formInfo || {};

  // we always want to prompt the user before closing the workspace
  promptBeforeClosing(() => true);

  const url = `${window.openmrsBase}/htmlformentryui/htmlform/${
    htmlForm.formUiPage
  }.page?patientId=${patientUuid}&visitId=${visitUuid ?? currentVisit?.uuid ?? null}&definitionUiResource=${
    htmlForm.formUiResource
  }&returnUrl=post-message:close-workspace`;
  const urlWithEncounter = `${window.openmrsBase}/htmlformentryui/htmlform/${
    htmlForm.formEditUiPage
  }.page?patientId=${patientUuid}&visitId=${
    visitUuid ?? currentVisit?.uuid ?? null
  }&encounterId=${encounterUuid}&definitionUiResource=${
    htmlForm.formUiResource
  }&returnUrl=post-message:close-workspace`;

  const showFormAndLoadedData = formInfo && patientUuid && patient;
  return (
    <div>
      {showFormAndLoadedData && (
        <HtmlFormEntryWrapper
          src={encounterUuid ? urlWithEncounter : url}
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
        />
      )}
    </div>
  );
};

export default HtmlFormEntry;
