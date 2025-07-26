import React from 'react';
import { Workspace2 } from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  type FormEntryProps,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import HtmlFormEntryWrapper from './html-form-entry-wrapper.component';

interface HtmlFormEntryComponentProps extends DefaultPatientWorkspaceProps {
  formInfo: FormEntryProps;
}

const HtmlFormEntry: React.FC<HtmlFormEntryComponentProps> = ({
  patientUuid,
  patient,
  closeWorkspaceWithSavedChanges,
  formInfo,
}) => {
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { encounterUuid, visitUuid, htmlForm } = formInfo || {};

  // urls for entering a new form and editing an existing form; note that we specify the returnUrl as post-message:close-workspace,
  // which tells HFE-UI to send a message to the parent window to close the workspace when the form is saved or cancelled

  const uiPage = encounterUuid ? htmlForm.formEditUiPage : htmlForm.formUiPage;
  const url = `${window.openmrsBase}/htmlformentryui/htmlform/${uiPage}.page?`;
  const searchParams = new URLSearchParams();
  searchParams.append('patientId', patientUuid);
  if (visitUuid || currentVisit?.uuid) {
    searchParams.append('visitId', visitUuid ?? currentVisit?.uuid);
  }
  if (encounterUuid) {
    searchParams.append('encounterId', encounterUuid);
  }
  if (htmlForm.formUiResource) {
    searchParams.append('definitionUiResource', htmlForm.formUiResource);
  } else {
    searchParams.append('formUuid', htmlForm.formUuid);
  }
  searchParams.append('returnUrl', 'post-message:close-workspace');

  const showFormAndLoadedData = formInfo && patientUuid;
  return (
    <Workspace2 title={htmlForm?.formName || 'Clinical form'} hasUnsavedChanges={true}>
      <div>
        {showFormAndLoadedData && (
          <HtmlFormEntryWrapper
            src={url + searchParams}
            closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          />
        )}
      </div>
    </Workspace2>
  );
};

export default HtmlFormEntry;
