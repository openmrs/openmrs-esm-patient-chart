import React from 'react';
import { FormEngine } from '@openmrs/esm-form-engine-lib';

// This wrapper component receives the `state` from the ExtensionSlot as props.
// It then renders the real FormEngine component, passing those props along.
const FormEngineWrapper = (props) => {
  return <FormEngine {...props} />;
};

export default FormEngineWrapper;
