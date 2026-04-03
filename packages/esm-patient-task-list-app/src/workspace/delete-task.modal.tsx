import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';
import { deleteTask, taskListSWRKey, type Task } from './task-list.resource';
import styles from './delete-task.scss';

interface DeleteTaskModalProps {
  closeModal: () => void;
  task: Task;
  patientUuid: string;
  onDeleted?: () => void;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({ closeModal, task, patientUuid, onDeleted }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      await deleteTask(patientUuid, task);
      await mutate(taskListSWRKey(patientUuid));

      closeModal();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        title: t('taskDeleted', 'Task deleted'),
      });
      onDeleted?.();
    } catch (error) {
      console.error('Error deleting task: ', error);

      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        title: t('errorDeletingTask', 'Error deleting task'),
        subtitle: error?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [closeModal, task, patientUuid, mutate, onDeleted, t]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('deleteTask', 'Delete task')} />
      <ModalBody>
        <p>{t('deleteTaskConfirmationText', 'Are you sure you want to delete this task?')}</p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button className={styles.deleteButton} kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{getCoreTranslation('delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeleteTaskModal;
