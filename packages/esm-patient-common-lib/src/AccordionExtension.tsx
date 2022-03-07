import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Accordion, AccordionItem } from 'carbon-components-react';

export interface AccordionExtensionProps {
  title: string;
  slotName?: string;
}

export const AccordionExtension = ({ title, slotName }: AccordionExtensionProps) => {
  return (
    <Accordion>
      <AccordionItem open title={title} style={{ border: 'none' }}>
        <ExtensionSlot extensionSlotName={slotName ?? title} />
      </AccordionItem>
    </Accordion>
  );
};
