import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import { useFavoritesActions } from './useFavoritesActions';
import type { DrugFavoriteOrder } from './types';
import styles from './delete-favorites.modal.scss';

interface DeleteFavoritesModalProps {
  closeModal: () => void;
  favorites: DrugFavoriteOrder[];
}

const DeleteFavoritesModal: React.FC<DeleteFavoritesModalProps> = ({ closeModal, favorites: favoritesToDelete }) => {
  const { t } = useTranslation();
  const { deleteMultipleFavorites } = useFavoritesActions();
  const [isDeleting, setIsDeleting] = useState(false);

  const isSingleDelete = favoritesToDelete.length === 1;
  const itemName = isSingleDelete ? favoritesToDelete[0]?.displayName : '';

  const handleDelete = useCallback(async () => {
    if (favoritesToDelete.length === 0) return;

    setIsDeleting(true);
    const success = await deleteMultipleFavorites(favoritesToDelete);
    setIsDeleting(false);

    if (success) {
      closeModal();
    }
  }, [favoritesToDelete, deleteMultipleFavorites, closeModal]);

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={
          isSingleDelete
            ? t('deletePinnedOrder', 'Delete pinned order')
            : t('deletePinnedOrders', 'Delete pinned orders')
        }
      />
      <ModalBody>
        <p>
          {isSingleDelete
            ? t('deleteOrderConfirmationText', 'Are you sure you want to delete "{{name}}" from your pinned orders?', {
                name: itemName,
              })
            : t(
                'deleteOrdersConfirmationText',
                'Are you sure you want to delete {{total}} orders from your pinned orders?',
                { total: favoritesToDelete.length },
              )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button className={styles.deleteButton} kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteFavoritesModal;
