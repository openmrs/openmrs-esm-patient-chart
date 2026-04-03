import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { Button, ButtonSet, Layer } from '@carbon/react';
import { ArrowLeft, Edit } from '@carbon/react/icons';
import { formatDate, getCoreTranslation, isOmrsDateToday, showModal, showSnackbar } from '@openmrs/esm-framework';
import Loader from '../loader/loader.component';
import {
  useTask,
  setTaskStatusCompleted,
  taskListSWRKey,
  getPriorityLabel,
  type Task,
  type DueDateType,
} from './task-list.resource';
import styles from './task-details-view.scss';

export interface TaskDetailsViewProps {
  patientUuid: string;
  taskUuid: string;
  onBack: () => void;
  onEdit?: (task: Task) => void;
}

export interface DueDateDisplay {
  type?: DueDateType;
  dueDate?: string;
  schedulingInfo?: string;
}

const TaskDetailsView: React.FC<TaskDetailsViewProps> = ({ patientUuid, taskUuid, onBack, onEdit }) => {
  const { t } = useTranslation();
  const { task, isLoading, error, mutate } = useTask(taskUuid);
  const { mutate: mutateList } = useSWRConfig();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = useCallback(() => {
    if (!task) {
      return;
    }

    const dispose = showModal('delete-task-confirmation-modal', {
      closeModal: () => dispose(),
      task,
      patientUuid,
      onDeleted: onBack,
    });
  }, [task, patientUuid, onBack]);

  const handleToggleCompletion = useCallback(
    async (completed: boolean) => {
      if (!task) {
        return;
      }

      setIsUpdating(true);
      try {
        await setTaskStatusCompleted(patientUuid, task, completed);
        await mutate();
        await mutateList(taskListSWRKey(patientUuid));
        showSnackbar({
          title: completed
            ? t('taskCompleted', 'Task marked as complete')
            : t('taskIncomplete', 'Task marked as incomplete'),
          kind: 'success',
        });
      } catch (_error) {
        showSnackbar({
          title: t('taskUpdateFailed', 'Unable to update task'),
          kind: 'error',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [task, patientUuid, mutate, mutateList, t],
  );

  const dueDateDisplay: DueDateDisplay = useMemo(() => {
    if (!task) {
      return {};
    }
    const scheduledToday = isOmrsDateToday(task.createdDate);
    if (task.dueDate?.type === 'DATE') {
      return {
        type: 'DATE',
        dueDate: formatDate(task.dueDate.date, { mode: 'wide' }),
      };
    }
    if (task.dueDate?.type === 'THIS_VISIT') {
      return {
        type: 'THIS_VISIT',
        schedulingInfo: scheduledToday
          ? t('scheduledTodayForThisVisit', 'Today for this visit')
          : t('scheduledOnThisVisit', 'On {{date}} for the same visit', {
              date: formatDate(task.createdDate),
            }),
        dueDate: task.dueDate.date ? formatDate(task.dueDate.date, { mode: 'wide' }) : undefined,
      };
    }
    if (task.dueDate?.type === 'NEXT_VISIT') {
      return {
        type: 'NEXT_VISIT',
        schedulingInfo: scheduledToday
          ? t('scheduledTodayForNextVisit', 'Today for next visit')
          : t('scheduledOnNextVisit', 'On {{date}} for the following visit', {
              date: formatDate(task.createdDate),
            }),
        dueDate: task.dueDate.date ? formatDate(task.dueDate.date, { mode: 'wide' }) : undefined,
      };
    }
    return {};
  }, [task, t]);

  const assigneeDisplay = task?.assignee
    ? task.assignee.display ?? task.assignee.uuid
    : t('noAssignment', 'No assignment');

  if (isLoading) {
    return <Loader />;
  }

  if (error || !task) {
    return (
      <>
        <p className={styles.errorText}>{t('taskLoadError', 'There was a problem loading the task.')}</p>
        <Button kind="ghost" renderIcon={(props) => <ArrowLeft size={16} {...props} />} onClick={onBack}>
          {t('backToTaskList', 'Back to task list')}
        </Button>
      </>
    );
  }

  return (
    <div className={styles.taskDetailsContainer}>
      <Layer className={styles.taskDetailsBox}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h5 className={styles.sectionTitle}>{t('task', 'Task')}</h5>
            {onEdit && (
              <Button
                kind="ghost"
                size="sm"
                renderIcon={(props) => <Edit size={16} {...props} />}
                onClick={() => onEdit(task)}
              >
                {getCoreTranslation('edit')}
              </Button>
            )}
          </div>
          <div>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t('name', 'Name')}</div>
              <div>{task.name}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t('createdBy', 'Created by')}</div>
              <div>{task.createdBy}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>{t('assignedTo', 'Assigned to')}</div>
              <div>{assigneeDisplay}</div>
            </div>
            {dueDateDisplay.type !== 'DATE' && dueDateDisplay.schedulingInfo && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>{t('scheduledInfo', 'Scheduled')}</div>
                <div>{dueDateDisplay.schedulingInfo}</div>
              </div>
            )}
            {dueDateDisplay.dueDate && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>{t('dueDate', 'Due date')}</div>
                <div>{dueDateDisplay.dueDate}</div>
              </div>
            )}
            {task.priority && (
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>{t('priorityLabel', 'Priority')}</div>
                <div>{getPriorityLabel(task.priority, t)}</div>
              </div>
            )}
          </div>
        </div>

        {task.rationale && (
          <div className={styles.section}>
            <h5 className={styles.sectionTitle}>{t('rationale', 'Rationale')}</h5>
            <div>
              <p>{task.rationale}</p>
            </div>
          </div>
        )}
      </Layer>
      <ButtonSet className={styles.actionButtons}>
        <Button kind="danger--tertiary" onClick={handleDelete}>
          {t('deleteTask', 'Delete task')}
        </Button>
        {!task.completed ? (
          <Button kind="secondary" onClick={() => handleToggleCompletion(true)} disabled={isUpdating}>
            {t('markComplete', 'Mark complete')}
          </Button>
        ) : (
          <Button kind="tertiary" onClick={() => handleToggleCompletion(false)} disabled={isUpdating}>
            {t('markIncomplete', 'Mark incomplete')}
          </Button>
        )}
      </ButtonSet>
    </div>
  );
};

export default TaskDetailsView;
