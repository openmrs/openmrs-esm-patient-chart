import React from 'react';
import {
  type DefaultPatientWorkspaceProps,
  type FormEntryProps,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import HtmlFormEntryWrapper from './html-form-entry-wrapper.component';
import { usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface HtmlFormEntryComponentProps extends DefaultPatientWorkspaceProps {
  formInfo: FormEntryProps;
}

const HtmlFormEntry: React.FC<HtmlFormEntryComponentProps> = ({
  patientUuid,
  title,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  setCancelTitle,
  setCancelMessage,
  setCancelConfirmText,
  formInfo,
}) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientUuid);
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { encounterUuid, visitUuid, htmlForm } = formInfo || {};

  // we always want to prompt the user before closing/hiding the workspace because we can't guarantee maintaining the state of the form
  promptBeforeClosing(() => true);

  // custom messaging to display to a user when closing the workspace without using the buttons within the form
  setCancelTitle(t('warning', 'Warning'));
  setCancelMessage(
    t('closeHtmlFormWarning', {
      defaultValue: 'Please use the Save or Cancel button on the {{title}} form to close the form.',
      replace: { title },
    }),
  );
  setCancelConfirmText(t('ignoreWarning', 'Ignore Warning'));

  // urls for entering a new form and editing an existing form; note that we specify the returnUrl as post-message:close-workspace,
  // which tells HFE-UI to send a message to the parent window to close the workspace when the form is saved or cancelled
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
