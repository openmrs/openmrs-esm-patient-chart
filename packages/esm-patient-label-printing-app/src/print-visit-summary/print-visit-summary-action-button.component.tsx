import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@carbon/react';
import { PrinterIcon, showModal, UserHasAccess, useConfig, useLayoutType, type Visit } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';

interface PrintVisitSummaryActionButtonProps {
  visit: Visit;
  patient: fhir.Patient;

  /**
   * If true, renders as IconButton instead
   */
  compact?: boolean;
}

const PrintVisitSummaryActionButton: React.FC<PrintVisitSummaryActionButtonProps> = ({ visit, compact }) => {
  const { t } = useTranslation();
  const { showPrintVisitSummaryButton } = useConfig<ConfigObject>();

  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const openPreviewModal = useCallback(() => {
    const dispose = showModal('print-visit-summary-modal', {
      visitUuid: visit.uuid,
      closeModal: () => dispose(),
    });
  }, [visit?.uuid]);

  if (!showPrintVisitSummaryButton || !visit?.uuid) {
    return null;
  }

  return (
    <UserHasAccess privilege="App: Can generate a Visit Summary">
      {compact ? (
        <IconButton
          onClick={openPreviewModal}
          label={t('printVisitSummary', 'Print visit summary')}
          size={responsiveSize}
          kind="ghost"
          align="top-end"
        >
          <PrinterIcon size={16} />
        </IconButton>
      ) : (
        <Button onClick={openPreviewModal} kind="ghost" renderIcon={PrinterIcon} size={responsiveSize}>
          {t('printVisitSummary', 'Print visit summary')}
        </Button>
      )}
    </UserHasAccess>
  );
};

export default PrintVisitSummaryActionButton;
