import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionItem } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { registerNavGroup } from '..';
import './dashboard-group-extension.scss';

export interface DashboardGroupExtensionProps {
  title: string;
  slotName?: string;
  basePath: string;
  isExpanded?: boolean;
}

export const DashboardGroupExtension = ({ title, slotName, basePath, isExpanded }: DashboardGroupExtensionProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);

  return (
    <Accordion className="nav-group">
      <AccordionItem open={isExpanded ?? true} title={t(title)}>
        <ExtensionSlot name={slotName ?? title} state={{ basePath }} />
      </AccordionItem>
    </Accordion>
  );
};
