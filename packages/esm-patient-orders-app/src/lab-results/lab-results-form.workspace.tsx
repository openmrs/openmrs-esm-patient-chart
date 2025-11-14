import React from 'react';
import { type Order, type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import ExportedLabResultsForm from './exported-lab-results-form.workspace';

export interface LabResultsFormProps {
  order: Order;
  /** Callback to refresh lab orders in the Laboratory app after results are saved.
   * This ensures the orders list stays in sync across the different tabs in the Laboratory app.
   * @see https://github.com/openmrs/openmrs-esm-laboratory-app/pull/117 */
  invalidateLabOrders?: () => void;
}

/**
 * This workspace displays the form to input lab results for orders.
 * This workspace should only be used within the patient chart. Use ExportedLabResultsForm
 * for use cases outside the patient chart.
 */
const LabResultsForm: React.FC<PatientWorkspace2DefinitionProps<LabResultsFormProps, {}>> = ({
  workspaceProps: { order, invalidateLabOrders },
  ...rest
}) => {
  return <ExportedLabResultsForm workspaceProps={{ order, invalidateLabOrders }} {...rest} />;
};

export default LabResultsForm;
