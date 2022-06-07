import React, { useState } from 'react';
import Forms from './forms.component';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from 'carbon-components-react';
import {
  DefaultWorkspaceProps,
  launchStartVisitPrompt,
  useActivePatientEnrollment,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, navigate, useConfig, usePatient } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import isEmpty from 'lodash-es/isEmpty';

interface FormsProps extends DefaultWorkspaceProps {
  patientUuid: string;
  isOffline: boolean;
}

interface Form {
  formUuid: string;
  encounterUuid: string;
}

const ClinicalForm: React.FC<FormsProps> = ({ patientUuid, isOffline, closeWorkspace }) => {
  const pageSize: number = 20;
  const { t } = useTranslation();
  const { htmlFormEntryForms } = useConfig() as ConfigObject;
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const { patient } = usePatient(patientUuid);
  const urlLabel: string = t('seeAll', 'See all');
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart/forms`;
  const [selectedForm, setSelectedForm] = useState<Form>(null);

  const handleLaunchForm = (form: Form) => {
    const htmlForm = htmlFormEntryForms.find((htmlForm) => htmlForm.formUuid === form.formUuid);
    if (currentVisit) {
      isEmpty(htmlForm)
        ? setSelectedForm(form)
        : navigate({
            to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.formUiPage}.page?patientId=${patient.id}&visitId=${currentVisit.uuid}&definitionUiResource=${htmlForm.formUiResource}&returnUrl=${window.location.href}`,
          });
    } else {
      launchStartVisitPrompt();
    }
  };

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading...')} />;
  }

  return (
    <>
      {selectedForm && patient ? (
        <ExtensionSlot
          extensionSlotName="form-widget-slot"
          state={{
            view: 'form',
            formUuid: selectedForm?.formUuid,
            visitUuid: currentVisit?.uuid,
            visitTypeUuid: currentVisit.visitType?.uuid,
            patientUuid,
            patient,
            encounterUuid: selectedForm?.encounterUuid ?? null,
            closeWorkspace,
          }}
        />
      ) : (
        <Forms
          patientUuid={patientUuid}
          patient={patient}
          pageSize={pageSize}
          urlLabel={urlLabel}
          pageUrl={pageUrl}
          isOffline={isOffline}
          activePatientEnrollment={activePatientEnrollment}
          launchForm={handleLaunchForm}
        />
      )}
    </>
  );
};

export default ClinicalForm;
