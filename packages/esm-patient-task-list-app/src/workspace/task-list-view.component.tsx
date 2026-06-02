import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Checkbox, Tile, Tag, Layer } from '@carbon/react';
import { showSnackbar, useLayoutType, EmptyCardIllustration } from '@openmrs/esm-framework';
import { type Task, useTaskList, setTaskStatusCompleted, getPriorityLabel } from './task-list.resource';
import Loader from '../loader/loader.component';
import styles from './task-list-view.scss';

export interface TaskListViewProps {
  patientUuid: string;
  onTaskClick?: (task: Task) => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ patientUuid, onTaskClick }) => {
  const { t } = useTranslation();
  const { tasks, isLoading, error, mutate } = useTaskList(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  const addPendingUpdate = useCallback((uuid: string) => {
    setPendingUpdates((current) => {
      const next = new Set(current);
      next.add(uuid);
      return next;
    });
  }, []);

  const removePendingUpdate = useCallback((uuid: string) => {
    setPendingUpdates((current) => {
      const next = new Set(current);
      next.delete(uuid);
      return next;
    });
  }, []);

  const handleToggle = useCallback(
    async (task: Task, checked: boolean) => {
      addPendingUpdate(task.uuid);
      try {
        await setTaskStatusCompleted(patientUuid, task, checked);
        await mutate();
      } catch (_error) {
        showSnackbar({
          title: t('taskUpdateFailed', 'Unable to update task'),
          kind: 'error',
        });
      } finally {
        removePendingUpdate(task.uuid);
      }
    },
    [addPendingUpdate, mutate, patientUuid, removePendingUpdate, t],
  );

  const isOverdue = useCallback((task: Task) => {
    if (task.completed || !task.dueDate) {
      return false;
    }
    const dueDate = task.dueDate.date;
    if (!dueDate) {
      return false;
    }
    const now = new Date();
    // Create new Date objects for comparison without mutating originals
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    return dueDateOnly < nowDateOnly;
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <p className={styles.errorText}>{t('taskListLoadError', 'There was a problem loading the task list.')}</p>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Layer>
        <Tile className={styles.emptyStateTile}>
          <div className={styles.emptyStateTileContent}>
            <EmptyCardIllustration />
            <p className={styles.emptyStateContent}>{t('noTasksMessage', 'No tasks yet')}</p>
          </div>
        </Tile>
      </Layer>
    );
  }

  return (
    <ul className={styles.taskList}>
      {tasks.map((task) => {
        const isUpdating = pendingUpdates.has(task.uuid);
        const overdue = isOverdue(task);
        const assigneeDisplay = task.assignee
          ? task.assignee.display ?? task.assignee.uuid
          : t('noAssignment', 'No assignment');

        return (
          <li key={task.uuid}>
            <Tile
              role="listitem"
              className={classNames(styles.taskTile, {
                [styles.tabletTaskTile]: isTablet,
                [styles.completedTile]: task.completed,
              })}
            >
              <div className={styles.taskTileCheckbox}>
                <div
                  className={classNames(styles.checkboxWrapper, {
                    [styles.completedCheckbox]: task.completed,
                  })}
                >
                  <Checkbox
                    id={`task-${task.uuid}`}
                    labelText=""
                    checked={task.completed}
                    disabled={isUpdating}
                    onChange={(_, { checked }) => handleToggle(task, checked)}
                  />
                </div>
              </div>
              <button onClick={() => onTaskClick?.(task)} className={styles.taskTileContentButton}>
                <div className={styles.taskNameWrapper}>
                  <span>{task.name}</span>
                  {task.rationale && <div className={styles.taskRationalePreview}>{task.rationale}</div>}
                  <div className={styles.taskAssignee}>{assigneeDisplay}</div>
                </div>
                <div className={styles.taskTags}>
                  {task.priority && (
                    <Tag
                      type={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'gray' : 'green'}
                      size="sm"
                    >
                      {getPriorityLabel(task.priority, t)}
                    </Tag>
                  )}
                  {overdue && (
                    <Tag type="red" size="sm">
                      {t('overdue', 'Overdue')}
                    </Tag>
                  )}
                </div>
              </button>
            </Tile>
          </li>
        );
      })}
    </ul>
  );
};

export default TaskListView;
