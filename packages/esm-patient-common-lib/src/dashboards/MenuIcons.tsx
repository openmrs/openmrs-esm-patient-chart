import React from 'react';
import {
  ActivityIcon,
  ShoppingCartIcon,
  MedicationIcon,
  ChartAverageIcon,
  CalendarHeatMapIcon,
  WarningIcon,
  ListCheckedIcon,
  DocumentAttachmentIcon,
  EventScheduleIcon,
  ReportIcon,
  SyringeIcon,
  ProgramsIcon,
} from '@openmrs/esm-framework';
import styles from './dashboard-extension.scss';

export type MenuTitle = keyof typeof MenuIcons;

export const MenuIcons = {
  'Patient Summary': ReportIcon,
  'Vitals & Biometrics': ActivityIcon,
  Medications: MedicationIcon,
  Orders: ShoppingCartIcon,
  Results: ChartAverageIcon,
  Visits: CalendarHeatMapIcon,
  Allergies: WarningIcon,
  Conditions: ListCheckedIcon,
  Immunizations: SyringeIcon,
  Attachments: DocumentAttachmentIcon,
  Programs: ProgramsIcon,
  Appointments: EventScheduleIcon,
} as const;

interface IconProps {
  title: MenuTitle;
}

export const IconRenderer = ({ title }: IconProps) => {
  const Icon = MenuIcons[title];
  return Icon ? <Icon className={styles.icon} /> : null;
};
