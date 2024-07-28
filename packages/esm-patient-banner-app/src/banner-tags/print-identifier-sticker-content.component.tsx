import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker-content.scss';
import IdentifierSticker from './print-identifier-sticker.component';

interface PrintIdentifierStickerContentProps {
  numberOfLabelRowsPerPage: number;
  numberOfLabelColumns: number;
  labels: Array<{}>;
  patient: fhir.Patient;
}

const PrintIdentifierStickerContent: React.FC<PrintIdentifierStickerContentProps> = ({
  numberOfLabelRowsPerPage,
  numberOfLabelColumns,
  labels,
  patient,
}) => {
  const { printIdentifierStickerWidth, printIdentifierStickerHeight, printIdentifierStickerPaperSize } =
    useConfig<ConfigObject>();

  if (numberOfLabelColumns < 1 || numberOfLabelRowsPerPage < 1 || labels.length < 1) {
    return;
  }
  const maxLabelsPerPage = numberOfLabelRowsPerPage * numberOfLabelColumns;
  const pages = [];

  for (let i = 0; i < labels.length; i += maxLabelsPerPage) {
    pages.push(labels.slice(i, i + maxLabelsPerPage));
  }

  return (
    <div>
      <style type="text/css" media="print">
        {`
            @page {
              size: ${printIdentifierStickerPaperSize};
            }
            @media print { html, body { height: initial !important; overflow: initial !important; background-color: white; }}
          `}
      </style>
      {pages.map((pageLabels, pageIndex) => (
        <div key={pageIndex} className={pageIndex < pages.length - 1 ? styles.pageBreak : ''}>
          <div
            className={styles.labelsContainer}
            style={{
              gridTemplateColumns: `repeat(${numberOfLabelColumns}, 1fr)`,
              gridTemplateRows: `repeat(${numberOfLabelRowsPerPage}, auto)`,
            }}
          >
            {pageLabels.map((_, index) => (
              <div
                key={index}
                className={styles.printContainer}
                style={{ height: printIdentifierStickerHeight, width: printIdentifierStickerWidth }}
              >
                <IdentifierSticker patient={patient} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrintIdentifierStickerContent;
