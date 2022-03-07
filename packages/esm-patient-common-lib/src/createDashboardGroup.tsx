import React from 'react';
import { AccordionExtension } from '.';
import { AccordionExtensionProps } from './AccordionExtension';

export const createDashboardGroup = ({ title, slotName }: AccordionExtensionProps) => {
  return <AccordionExtension title={title} slotName={slotName} />;
};
