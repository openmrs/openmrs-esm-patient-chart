import React from 'react';
import { Button, IconButton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EditIcon, type Visit, navigate, useLayoutType } from '@openmrs/esm-framework';
import { ArrowRight } from '@carbon/react/icons';

interface VisitDetailsLinkActionItemProps {
  patientUuid: string;
  visit: Visit;

  /**
   * If true, renders as IconButton instead
   */
  compact?: boolean;
}

const VisitDetailsLinkActionItem: React.FC<VisitDetailsLinkActionItemProps> = ({ patientUuid, visit, compact }) => {
  const { t } = useTranslation();

  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const redirectToVisitDetailsPage = () => {
    navigate({
      to: `\${openmrsSpaBase}/patient/${patientUuid}/chart/Visits/${visit.uuid}`,
    });
  };

  if (compact) {
    return (
      <IconButton
        onClick={redirectToVisitDetailsPage}
        label={t('visitDetails', 'Visit details')}
        size={responsiveSize}
        kind="ghost"
      >
        <ArrowRight size={16} />
      </IconButton>
    );
  }

  return (
    <Button onClick={redirectToVisitDetailsPage} kind="ghost" renderIcon={EditIcon} size={responsiveSize}>
      {t('visitDetails', 'Visit details')}
    </Button>
  );
};

export default VisitDetailsLinkActionItem;
