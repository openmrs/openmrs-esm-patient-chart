import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioButton,
  RadioButtonGroup,
  SkeletonText,
  Tile,
} from '@carbon/react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { useDrugsByConceptName } from './drug-favorites.resource';
import styles from './strength-picker.modal.scss';

interface StrengthPickerModalProps {
  closeModal: () => void;
  conceptUuid: string;
  conceptName: string;
  onSelectDrug: (drug: Drug) => void;
}

const StrengthPickerModal: React.FC<StrengthPickerModalProps> = ({
  closeModal,
  conceptUuid,
  conceptName,
  onSelectDrug,
}) => {
  const { t } = useTranslation();
  const [selectedDrugUuid, setSelectedDrugUuid] = useState<string | null>(null);

  const { matchingDrugs, isLoading, error } = useDrugsByConceptName(conceptName, conceptUuid);

  const handleSelect = () => {
    const selectedDrug = matchingDrugs.find((d) => d.uuid === selectedDrugUuid);
    if (selectedDrug) {
      onSelectDrug(selectedDrug);
      closeModal();
    }
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('selectStrength', 'Select strength')} />
      <ModalBody>
        <p className={styles.hint}>
          {t('selectStrengthHint', 'Select the strength for {{drugName}}', { drugName: conceptName })}
        </p>

        {isLoading && (
          <div className={styles.skeletonContainer}>
            <SkeletonText width="100%" />
            <SkeletonText width="100%" />
            <SkeletonText width="100%" />
          </div>
        )}

        {error && (
          <Tile className={styles.errorTile}>
            <p>{t('errorLoadingStrengths', 'Error loading available strengths')}</p>
          </Tile>
        )}

        {!isLoading && !error && matchingDrugs.length === 0 && (
          <Tile className={styles.emptyTile}>
            <p>{t('noStrengthsFound', 'No strengths found for this medication')}</p>
          </Tile>
        )}

        {!isLoading && !error && matchingDrugs.length > 0 && (
          <RadioButtonGroup
            legendText=""
            name="strength-selection"
            orientation="vertical"
            onChange={(value: string) => setSelectedDrugUuid(value)}
            valueSelected={selectedDrugUuid}
          >
            {matchingDrugs.map((drug) => (
              <RadioButton
                key={drug.uuid}
                id={drug.uuid}
                labelText={
                  <span className={styles.drugOption}>
                    <span className={styles.drugStrength}>{drug.strength || drug.display}</span>
                    {drug.dosageForm?.display && <span className={styles.drugForm}>{drug.dosageForm.display}</span>}
                  </span>
                }
                value={drug.uuid}
              />
            ))}
          </RadioButtonGroup>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleSelect} disabled={!selectedDrugUuid}>
          {t('continue', 'Continue')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default StrengthPickerModal;
