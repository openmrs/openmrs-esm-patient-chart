import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Workspace2 } from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import ProceduresFormComponent from './procedures-form.component';
import { type Procedure } from '../types';

export type ProceduresFormProps = {
  procedure?: Procedure;
  formContext: 'creating' | 'editing';
};

const schema = z
  .object({
    procedureCoded: z.string().min(1, 'A procedure is required'),
    procedureType: z.string().min(1, 'Procedure type is required'),
    bodySite: z.string().min(1, 'Body site is required'),
    startDateTime: z.date().optional().nullable(),
    endDateTime: z.date().optional().nullable(),
    status: z.string().min(1, 'Status is required'),
    notes: z.string().optional(),
    estimatedStartDate: z.string().optional(),
    duration: z.number().int().positive('Duration must be a positive number').nullable().optional(),
    durationUnit: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return data.endDateTime >= data.startDateTime;
      }
      return true;
    },
    { message: 'End date must be on or after start date', path: ['endDateTime'] },
  )
  .refine(
    (data) => {
      const hasDuration = data.duration != null;
      return !hasDuration || Boolean(data.durationUnit);
    },
    { message: 'Duration unit is required when a duration is provided', path: ['durationUnit'] },
  );

export type ProceduresFormSchema = z.infer<typeof schema>;

const ProceduresForm: React.FC<PatientWorkspace2DefinitionProps<ProceduresFormProps, object>> = ({
  closeWorkspace,
  groupProps: { patientUuid },
  workspaceProps: { procedure, formContext },
}) => {
  const { t } = useTranslation();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const methods = useForm<ProceduresFormSchema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      procedureCoded: procedure?.procedureCoded?.uuid ?? '',
      procedureType: procedure?.procedureType?.uuid ?? '',
      bodySite: procedure?.bodySite?.uuid ?? '',
      startDateTime: procedure?.startDateTime ? new Date(procedure.startDateTime) : null,
      endDateTime: procedure?.endDateTime ? new Date(procedure.endDateTime) : null,
      status: procedure?.status?.uuid ?? '',
      notes: procedure?.notes ?? '',
      estimatedStartDate: procedure?.estimatedStartDate ?? '',
      duration: typeof procedure?.duration === 'number' ? procedure.duration : null,
      durationUnit: procedure?.durationUnit?.uuid ?? '',
    },
  });

  const closeWorkspaceWithSavedChanges = useCallback(() => {
    closeWorkspace({ discardUnsavedChanges: true });
  }, [closeWorkspace]);

  return (
    <Workspace2
      title={
        formContext === 'editing' ? t('editProcedure', 'Edit procedure') : t('recordProcedure', 'Record procedure')
      }
      hasUnsavedChanges={methods.formState.isDirty}
    >
      <FormProvider {...methods}>
        <ProceduresFormComponent
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          isSubmittingForm={isSubmittingForm}
          patientUuid={patientUuid}
          procedure={procedure}
        />
      </FormProvider>
    </Workspace2>
  );
};

export default ProceduresForm;
