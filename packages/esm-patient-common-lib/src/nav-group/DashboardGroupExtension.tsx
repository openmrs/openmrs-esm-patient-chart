import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Accordion, AccordionItem } from '@carbon/react';
import { registerNavGroup } from '..';

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

  // t('myNavGroupTitle', 'My Nav Group Title')
  const translatedNavGroupTitle = t(title);

  return (
    <Accordion>
      <AccordionItem open={isExpanded ?? true} title={translatedNavGroupTitle} style={{ border: 'none' }}>
        <ExtensionSlot name={slotName ?? title} state={{ basePath }} />
      </AccordionItem>
    </Accordion>
  );
};
