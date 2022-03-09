import React, { useEffect } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Accordion, AccordionItem } from 'carbon-components-react';
import { registerNavGroup } from '..';

export interface DashboardGroupExtensionProps {
  title: string;
  slotName?: string;
  basePath: string;
}

export const DashboardGroupExtension = ({ title, slotName, basePath }: DashboardGroupExtensionProps) => {
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);

  return (
    <Accordion>
      <AccordionItem open title={title} style={{ border: 'none' }}>
        <ExtensionSlot extensionSlotName={slotName ?? title} state={{ basePath }} />
      </AccordionItem>
    </Accordion>
  );
};
