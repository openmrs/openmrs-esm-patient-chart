import React, { useMemo } from 'react';
import classNames from 'classnames';
import last from 'lodash-es/last';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  ConfigurableLink,
  ActivityIcon,
  ShoppingCartIcon,
  MedicationIcon,
  ChartAverageIcon,
  CalendarHeatMapIcon,
  WarningIcon,
  ListCheckedIcon,
  DocumentAttachmentIcon,
  TableIcon,
  EventScheduleIcon,
} from '@openmrs/esm-framework';
import { Report } from '@carbon/react/icons';
import styles from './dashboard-extension.scss';

export interface DashboardExtensionProps {
  path: string;
  title: string;
  basePath: string;
  moduleName?: string;
}

export const DashboardExtension = ({
  path,
  title,
  basePath,
  moduleName = '@openmrs/esm-patient-chart-app',
}: DashboardExtensionProps) => {
  const { t } = useTranslation(moduleName);
  const location = useLocation();
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);

  const menuIcon = (title: string) => {
    switch (title) {
      case 'Patient Summary':
        return <Report className={styles.icon} />;
      case 'Vitals & Biometrics':
        return <ActivityIcon className={styles.icon} />;
      case 'Orders':
        return <ShoppingCartIcon className={styles.icon} />;
      case 'Medications':
        return <MedicationIcon className={styles.icon} />;
      case 'Results':
        return <ChartAverageIcon className={styles.icon} />;
      case 'Visits':
        return <CalendarHeatMapIcon className={styles.icon} />;
      case 'Allergies':
        return <WarningIcon className={styles.icon} />;
      case 'Conditions':
        return <ListCheckedIcon className={styles.icon} />;
      case 'Attachments':
        return <DocumentAttachmentIcon className={styles.icon} />;
      case 'Programs':
        return <TableIcon className={styles.icon} />;
      case 'Appointments':
        return <EventScheduleIcon className={styles.icon} />;
      default:
        return null;
    }
  };

  const renderIcon = menuIcon(title);

  return (
    <div key={path}>
      <ConfigurableLink
        className={classNames('cds--side-nav__link', { 'active-left-nav-link': path === navLink })}
        to={`${basePath}/${encodeURIComponent(path)}`}
      >
        <span className={styles.menu}>
          {renderIcon}
          <span>{t(title)}</span>
        </span>
      </ConfigurableLink>
    </div>
  );
};
