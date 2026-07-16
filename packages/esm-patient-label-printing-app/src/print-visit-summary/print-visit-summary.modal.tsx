import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, InlineNotification, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { DownloadIcon, getCoreTranslation } from '@openmrs/esm-framework';
import {
  fetchVisitSummaryPdf,
  getVisitSummaryPdfErrorType,
  type VisitSummaryPdfErrorType,
} from './print-visit-summary.resource';
import styles from './print-visit-summary.scss';

interface PrintVisitSummaryModalProps {
  visitUuid: string;
  closeModal: () => void;
}

const PrintVisitSummaryModal: React.FC<PrintVisitSummaryModalProps> = ({ visitUuid, closeModal }) => {
  const { t } = useTranslation();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<VisitSummaryPdfErrorType | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    let createdObjectUrl: string | null = null;

    fetchVisitSummaryPdf(visitUuid, abortController)
      .then((blob) => {
        if (abortController.signal.aborted) {
          return;
        }
        createdObjectUrl = window.URL.createObjectURL(blob);
        setObjectUrl(createdObjectUrl);
      })
      .catch((error) => {
        if (abortController.signal.aborted) {
          return;
        }
        setErrorType(getVisitSummaryPdfErrorType(error));
      });

    return () => {
      abortController.abort();
      if (createdObjectUrl) {
        window.URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [visitUuid]);

  const errorMessages: Record<VisitSummaryPdfErrorType, { title: string; subtitle: string }> = {
    notAuthorized: {
      title: t('visitSummaryNotAuthorizedTitle', 'Not authorized'),
      subtitle: t(
        'visitSummaryNotAuthorized',
        'You do not have permission to generate visit summaries. Contact your administrator for access.',
      ),
    },
    visitNotFound: {
      title: t('visitSummaryVisitNotFoundTitle', 'Visit not found'),
      subtitle: t(
        'visitSummaryVisitNotFound',
        'This visit could not be found on the server. Refresh the page and try again.',
      ),
    },
    generationFailed: {
      title: t('visitSummaryGenerationFailedTitle', 'PDF generation failed'),
      subtitle: t(
        'visitSummaryGenerationFailed',
        'The server could not generate the visit summary. Try again — if the problem persists, contact your administrator.',
      ),
    },
    network: {
      title: t('visitSummaryNetworkErrorTitle', 'Network error'),
      subtitle: t(
        'visitSummaryNetworkError',
        'The visit summary could not be retrieved. Check your internet connection and try again.',
      ),
    },
  };

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('visitSummary', 'Visit summary')} />
      <ModalBody className={styles.modalBody}>
        {errorType ? (
          <InlineNotification
            kind="error"
            lowContrast
            hideCloseButton
            title={errorMessages[errorType].title}
            subtitle={errorMessages[errorType].subtitle}
          />
        ) : objectUrl ? (
          <iframe
            className={styles.previewFrame}
            src={objectUrl}
            title={t('visitSummaryPreview', 'Visit summary preview')}
          />
        ) : (
          <InlineLoading description={t('generatingVisitSummary', 'Generating visit summary')} />
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {getCoreTranslation('close', 'Close')}
        </Button>
        {objectUrl ? (
          <Button as="a" href={objectUrl} download="visit-summary.pdf" kind="primary" renderIcon={DownloadIcon}>
            {t('download', 'Download')}
          </Button>
        ) : (
          <Button kind="primary" disabled renderIcon={DownloadIcon}>
            {t('download', 'Download')}
          </Button>
        )}
      </ModalFooter>
    </div>
  );
};

export default PrintVisitSummaryModal;
