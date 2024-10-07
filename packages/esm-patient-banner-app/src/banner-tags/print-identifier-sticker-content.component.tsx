import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import IdentifierSticker from './print-identifier-sticker.component';
import styles from './print-identifier-sticker-content.scss';

interface PrintIdentifierStickerContentProps {
  labels: Array<{}>;
  numberOfLabelColumns: number;
  numberOfLabelRowsPerPage: number;
  patient: fhir.Patient;
}

const PrintIdentifierStickerContent = forwardRef<HTMLDivElement, PrintIdentifierStickerContentProps>(
  ({ labels, numberOfLabelColumns, numberOfLabelRowsPerPage, patient }, ref) => {
    const { printIdentifierStickerWidth, printIdentifierStickerHeight, printIdentifierStickerPaperSize } =
      useConfig<ConfigObject>();

    const maxLabelsPerPage = numberOfLabelRowsPerPage * numberOfLabelColumns;
    const pages: Array<typeof labels> = [];

    for (let i = 0; i < labels.length; i += maxLabelsPerPage) {
      pages.push(labels.slice(i, i + maxLabelsPerPage));
    }
    const divRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => divRef.current);

    useEffect(() => {
      if (divRef.current) {
        const style = divRef.current.style;
        style.setProperty('--omrs-print-label-paper-size', printIdentifierStickerPaperSize);
        style.setProperty('--omrs-print-label-columns', numberOfLabelColumns.toString());
        style.setProperty('--omrs-print-label-rows', numberOfLabelRowsPerPage.toString());
        style.setProperty('--omrs-print-label-sticker-height', printIdentifierStickerHeight);
        style.setProperty('--omrs-print-label-sticker-width', printIdentifierStickerWidth);
      }
    }, [
      numberOfLabelColumns,
      numberOfLabelRowsPerPage,
      printIdentifierStickerHeight,
      printIdentifierStickerPaperSize,
      printIdentifierStickerWidth,
    ]);

    if (numberOfLabelColumns < 1 || numberOfLabelRowsPerPage < 1 || labels.length < 1) {
      return;
    }

    return (
      <div ref={divRef} className={styles.printRoot}>
        {pages.map((pageLabels, pageIndex) => (
          <div key={pageIndex} className={pageIndex < pages.length - 1 ? styles.pageBreak : ''}>
            <div className={styles.labelsContainer}>
              {pageLabels.map((_, index) => (
                <div key={index} className={styles.printContainer}>
                  <IdentifierSticker patient={patient} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

export default PrintIdentifierStickerContent;
