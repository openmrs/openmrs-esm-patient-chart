import { useConfig } from '@openmrs/esm-framework';
import { AccordionExtension } from '@openmrs/esm-patient-common-lib';
import React from 'react';

export default function GenericNavGroup() {
  const config = useConfig();
  return <AccordionExtension title={config.navGroup.title} slotName={config.navGroup.slotName} />;
}
