import React, { useState } from 'react';
import { Button, InlineLoading, InlineNotification, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import { removeVisitNoteImage, type SavedVisitNoteImage } from './visit-notes.resource';

interface RemoveVisitNoteImageModalProps {
  image: SavedVisitNoteImage;
  close: () => void;
  onRemoved: () => void;
}

export default function RemoveVisitNoteImageModal({ image, close, onRemoved }: RemoveVisitNoteImageModalProps) {
  const { t } = useTranslation();
  const [isRemoving, setIsRemoving] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function remove() {
    setIsRemoving(true);
    setHasError(false);
    try {
      await removeVisitNoteImage(image.id);
    } catch {
      setHasError(true);
      setIsRemoving(false);
      return;
    }
    onRemoved();
    close();
    showSnackbar({ kind: 'success', title: t('imageRemoved', 'Image removed') });
  }

  return (
    <>
      <ModalHeader closeModal={isRemoving ? undefined : close}>
        {t('removeSavedImage', 'Remove saved image')}
      </ModalHeader>
      <ModalBody>
        <p>
          {t(
            'removeSavedImageConfirmation',
            'Remove "{{name}}" from this visit note? The image will be removed immediately. Discarding changes to the note will not restore it.',
            { name: image.description || image.filename || t('savedImage', 'Saved image') },
          )}
        </p>
        {hasError && (
          <InlineNotification
            kind="error"
            hideCloseButton
            title={t('removeSavedImageError', 'Could not remove the image. Please try again.')}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={close} disabled={isRemoving}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="danger" onClick={remove} disabled={isRemoving}>
          {isRemoving ? <InlineLoading description={t('removingImage', 'Removing image...')} /> : t('remove', 'Remove')}
        </Button>
      </ModalFooter>
    </>
  );
}
