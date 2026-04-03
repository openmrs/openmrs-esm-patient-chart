import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  ButtonSet,
  ComboBox,
  ContentSwitcher,
  Form,
  FormGroup,
  InlineNotification,
  Layer,
  Switch,
  TextArea,
  TextInput,
} from '@carbon/react';
import {
  showSnackbar,
  useLayoutType,
  useConfig,
  parseDate,
  useVisit,
  OpenmrsDatePicker,
  getCoreTranslation,
} from '@openmrs/esm-framework';
import styles from './add-task-form.scss';
import {
  useProviderRoles,
  saveTask,
  updateTask,
  taskListSWRKey,
  getPriorityLabel,
  type TaskInput,
  type Priority,
  type Task,
  type SystemTask,
  useFetchProviders,
  useReferenceVisit,
  useTask,
  useSystemTasks,
} from './task-list.resource';
import { useSWRConfig } from 'swr';

export interface AddTaskFormProps {
  patientUuid: string;
  onBack: () => void;
  editTaskUuid?: string;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ patientUuid, onBack, editTaskUuid }) => {
  const { t } = useTranslation();
  const isEditMode = Boolean(editTaskUuid);

  const { task: existingTask, isLoading: isTaskLoading } = useTask(editTaskUuid ?? '');

  const { activeVisit, isLoading: isVisitLoading } = useVisit(patientUuid);

  const { providers, setProviderQuery, isLoading: isLoadingProviders, error: providersError } = useFetchProviders();

  const { allowAssigningProviderRole } = useConfig();

  const { systemTasks, isLoading: isSystemTasksLoading } = useSystemTasks();

  const [selectedSystemTask, setSelectedSystemTask] = useState<SystemTask | null>(null);
  const [isCustomTaskName, setIsCustomTaskName] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');

  const optionSchema = z.object({
    id: z.string(),
    label: z.string().optional(),
  });

  const { mutate } = useSWRConfig();

  const schema = z
    .object({
      taskName: z.string().min(1),
      dueDateType: z.enum(['THIS_VISIT', 'NEXT_VISIT', 'DATE']).optional(),
      dueDate: z.string().optional(),
      rationale: z.string().optional(),
      assignee: optionSchema.optional(),
      assigneeRole: optionSchema.optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
    })
    .refine((values) => !(values.assignee && values.assigneeRole), {
      message: t('selectSingleAssignee', 'Select either a provider or a provider role, not both'),
      path: ['assigneeRole'],
    })
    .refine((values) => values.dueDateType !== 'DATE' || values.dueDate, {
      message: t('dueDateRequired', 'Due date is required when Date is selected'),
      path: ['dueDate'],
    });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      taskName: '',
      dueDateType: undefined,
      dueDate: undefined,
      rationale: '',
      assignee: undefined,
      assigneeRole: undefined,
      priority: undefined,
    },
  });

  // Populate form with existing task data when editing
  useEffect(() => {
    if (isEditMode && existingTask) {
      const formattedDueDate =
        existingTask.dueDate?.type === 'DATE' && existingTask.dueDate?.date
          ? existingTask.dueDate.date.toISOString().split('T')[0]
          : undefined;

      reset({
        taskName: existingTask.name,
        dueDateType: existingTask.dueDate?.type,
        dueDate: formattedDueDate,
        rationale: existingTask.rationale ?? '',
        assignee:
          existingTask.assignee?.type === 'person'
            ? { id: existingTask.assignee.uuid, label: existingTask.assignee.display }
            : undefined,
        assigneeRole:
          existingTask.assignee?.type === 'role'
            ? { id: existingTask.assignee.uuid, label: existingTask.assignee.display }
            : undefined,
        priority: existingTask.priority,
      });

      // Check if the existing task matches a system task
      // If so, set the selected system task state
      if (systemTasks.length > 0) {
        const matchingSystemTask = existingTask.systemTaskUuid
          ? systemTasks.find((st) => st.uuid === existingTask.systemTaskUuid)
          : null;

        if (matchingSystemTask) {
          setSelectedSystemTask(matchingSystemTask);
          setIsCustomTaskName(false);
          setCustomInputValue('');
        } else {
          setSelectedSystemTask(null);
          setIsCustomTaskName(true);
          setCustomInputValue(existingTask.name);
        }
      }
    }
  }, [isEditMode, existingTask, reset, systemTasks]);

  const selectedDueDateType = watch('dueDateType');

  // Fetch current or last visit for NEXT_VISIT
  const {
    data: referenceVisitData,
    isLoading: isReferenceVisitLoading,
    error: referenceVisitError,
  } = useReferenceVisit(selectedDueDateType, patientUuid);

  const providerOptions = useMemo(
    () =>
      providers.map((provider) => ({
        id: provider.uuid,
        label: provider.display,
      })),
    [providers],
  );
  const providerRoleOptions = useProviderRoles();

  const handleFormSubmission = async (data: z.infer<typeof schema>) => {
    try {
      // Get visit UUID if THIS_VISIT or NEXT_VISIT is selected
      let visitUuid: string | undefined;
      if (data.dueDateType === 'THIS_VISIT') {
        visitUuid = activeVisit?.uuid;
      } else if (data.dueDateType === 'NEXT_VISIT') {
        visitUuid = referenceVisitData?.results?.[0]?.uuid;
      }

      const assignee = data.assignee
        ? { uuid: data.assignee.id, display: data.assignee.label, type: 'person' as const }
        : data.assigneeRole
          ? { uuid: data.assigneeRole.id, display: data.assigneeRole.label, type: 'role' as const }
          : undefined;

      if (isEditMode && existingTask) {
        const updatedTask: Task = {
          ...existingTask,
          name: data.taskName.trim(),
          dueDate: {
            type: data.dueDateType,
            date: parseDate(data.dueDate),
            referenceVisitUuid: visitUuid,
          },
          rationale: data.rationale?.trim() || undefined,
          assignee,
          priority: data.priority,
          // Preserve systemTaskUuid from existing task (cannot be changed during edit)
          systemTaskUuid: existingTask.systemTaskUuid,
        };

        await updateTask(patientUuid, updatedTask);
        await mutate(taskListSWRKey(patientUuid));
        showSnackbar({
          title: t('taskUpdated', 'Task updated'),
          kind: 'success',
        });
      } else {
        const payload: TaskInput = {
          name: data.taskName.trim(),
          dueDate: {
            type: data.dueDateType,
            date: parseDate(data.dueDate),
            referenceVisitUuid: visitUuid,
          },
          rationale: data.rationale?.trim() || undefined,
          assignee,
          priority: data.priority,
          systemTaskUuid: selectedSystemTask?.uuid,
        };

        await saveTask(patientUuid, payload);
        await mutate(taskListSWRKey(patientUuid));
        showSnackbar({
          title: t('taskAdded', 'Task added'),
          kind: 'success',
        });
      }
      onBack();
    } catch (error) {
      showSnackbar({
        title: isEditMode ? t('taskUpdateFailed', 'Unable to update task') : t('taskAddFailed', 'Task add failed'),
        kind: 'error',
      });
    }
  };

  return (
    <>
      <div className={styles.formContainer}>
        <Form onSubmit={handleSubmit(handleFormSubmission)}>
          <div className={styles.formSection}>
            <h5 className={styles.formSectionHeader}>{t('task', 'Task')}</h5>
            <InputWrapper>
              {/* Show info banner when editing a system task */}
              {isEditMode && selectedSystemTask && (
                <InlineNotification
                  kind="info"
                  lowContrast
                  hideCloseButton
                  title={t('systemTaskEditTitle', "You're editing a system task")}
                  subtitle={t('systemTaskEditSubtitle', 'Task name cannot be changed.')}
                  className={styles.systemTaskNotification}
                />
              )}

              <Controller
                name="taskName"
                control={control}
                render={({ field }) =>
                  systemTasks.length > 0 && !isSystemTasksLoading ? (
                    <div className={selectedSystemTask ? styles.systemTaskSelected : undefined}>
                      <ComboBox
                        key={isEditMode && isCustomTaskName ? `custom-${customInputValue}` : 'system'}
                        id="taskName"
                        titleText={t('taskNameLabel', 'Task name')}
                        placeholder={t('taskNamePlaceholder', 'Enter or select task name')}
                        items={systemTasks}
                        itemToString={(item: SystemTask | null) => item?.title ?? ''}
                        selectedItem={selectedSystemTask}
                        initialSelectedItem={
                          isEditMode && isCustomTaskName
                            ? ({ uuid: 'custom', name: 'custom', title: customInputValue } as SystemTask)
                            : undefined
                        }
                        disabled={isEditMode && !!selectedSystemTask}
                        allowCustomValue
                        onChange={({ selectedItem, inputValue }) => {
                          if (selectedItem) {
                            // A system task was selected from the dropdown
                            setSelectedSystemTask(selectedItem);
                            setIsCustomTaskName(false);
                            setCustomInputValue('');
                            field.onChange(selectedItem.title);

                            // Apply system task defaults
                            if (selectedItem.priority) {
                              setValue('priority', selectedItem.priority);
                            }
                            if (selectedItem.rationale) {
                              setValue('rationale', selectedItem.rationale);
                            }
                            if (selectedItem.defaultAssigneeRoleUuid) {
                              setValue('assigneeRole', {
                                id: selectedItem.defaultAssigneeRoleUuid,
                                label: selectedItem.defaultAssigneeRoleDisplay,
                              });
                              setValue('assignee', undefined);
                            }
                          } else if (inputValue !== undefined) {
                            // Custom value entered
                            setSelectedSystemTask(null);
                            setIsCustomTaskName(inputValue.length > 0);
                            setCustomInputValue(inputValue);
                            field.onChange(inputValue);
                          }
                        }}
                        onInputChange={(inputValue) => {
                          // When typing, check if it still matches a system task
                          const matchingTask = systemTasks.find(
                            (st) => st.title.toLowerCase() === inputValue?.toLowerCase(),
                          );
                          if (!matchingTask) {
                            setSelectedSystemTask(null);
                            setIsCustomTaskName(inputValue?.length > 0);
                            setCustomInputValue(inputValue ?? '');
                            field.onChange(inputValue ?? '');
                          }
                        }}
                        invalid={Boolean(errors.taskName)}
                        invalidText={
                          errors.taskName?.message ? t('taskNameRequired', 'Task name is required') : undefined
                        }
                      />
                      {isCustomTaskName && !selectedSystemTask && (
                        <InlineNotification
                          kind="info"
                          lowContrast
                          hideCloseButton
                          title={t('customTaskName', 'Custom task')}
                          className={styles.customTaskNotification}
                        />
                      )}
                    </div>
                  ) : (
                    <TextInput
                      id="taskName"
                      labelText={t('taskNameLabel', 'Task name')}
                      placeholder={t('taskNamePlaceholder', 'Enter task name')}
                      invalid={Boolean(errors.taskName)}
                      invalidText={
                        errors.taskName?.message ? t('taskNameRequired', 'Task name is required') : undefined
                      }
                      {...field}
                    />
                  )
                }
              />
            </InputWrapper>

            <InputWrapper>
              <FormGroup legendText={t('dueLabel', 'Due')}>
                <Controller
                  name="dueDateType"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    const validDueDateTypes: Array<'NEXT_VISIT' | 'THIS_VISIT' | 'DATE'> = [
                      'NEXT_VISIT',
                      'THIS_VISIT',
                      'DATE',
                    ];
                    const idx = validDueDateTypes.indexOf(value as 'NEXT_VISIT' | 'THIS_VISIT' | 'DATE');
                    const selectedIndex = idx >= 0 ? idx : 0;

                    return (
                      <ContentSwitcher
                        selectedIndex={selectedIndex}
                        onChange={({ name }) => {
                          onChange(name);
                          if (name === 'NEXT_VISIT' || name === 'THIS_VISIT') {
                            setValue('dueDate', undefined);
                          }
                        }}
                        size="md"
                      >
                        <Switch
                          name="NEXT_VISIT"
                          text={t('nextVisit', 'Next visit')}
                          disabled={isReferenceVisitLoading || !!referenceVisitError}
                        />
                        <Switch
                          name="THIS_VISIT"
                          text={t('thisVisit', 'This visit')}
                          disabled={isVisitLoading || !activeVisit}
                        />
                        <Switch name="DATE" text={t('date', 'Date')} />
                      </ContentSwitcher>
                    );
                  }}
                />
              </FormGroup>
              {selectedDueDateType === 'DATE' && (
                <div className={styles.datePickerWrapper}>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <OpenmrsDatePicker
                        id="dueDate"
                        labelText={t('dueDateLabel', 'Due date')}
                        minDate={new Date()}
                        invalid={Boolean(errors.dueDate)}
                        invalidText={errors.dueDate?.message}
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date: Date) => field.onChange(date?.toISOString())}
                      />
                    )}
                  />
                </div>
              )}
            </InputWrapper>

            <InputWrapper>
              <Controller
                name="assignee"
                control={control}
                render={({ field }) => (
                  <ComboBox
                    id="assignee"
                    titleText={t('assignProviderLabel', 'Assign to provider')}
                    placeholder={t('assignProviderPlaceholder', 'Search providers')}
                    items={providerOptions}
                    itemToString={(item) => item?.label ?? ''}
                    selectedItem={field.value ?? null}
                    onChange={({ selectedItem }) => {
                      field.onChange(selectedItem ?? undefined);
                      if (selectedItem) {
                        setValue('assigneeRole', undefined, { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                    onInputChange={(input) => setProviderQuery(input)}
                    helperText={t('providerSearchHint', 'Start typing to search for providers')}
                    invalid={Boolean(errors.assignee)}
                    invalidText={errors.assignee?.message}
                  />
                )}
              />
            </InputWrapper>

            {allowAssigningProviderRole && (
              <InputWrapper>
                <Controller
                  name="assigneeRole"
                  control={control}
                  render={({ field }) => (
                    <ComboBox
                      id="assigneeRole"
                      titleText={t('assignProviderRoleLabel', 'Assign to provider role')}
                      placeholder={t('assignProviderRolePlaceholder', 'Search provider roles')}
                      items={providerRoleOptions}
                      itemToString={(item) => item?.label ?? ''}
                      selectedItem={field.value ?? null}
                      onChange={({ selectedItem }) => {
                        field.onChange(selectedItem ?? undefined);
                        if (selectedItem) {
                          setValue('assignee', undefined, { shouldDirty: true, shouldValidate: true });
                        }
                      }}
                      invalid={Boolean(errors.assigneeRole)}
                      invalidText={errors.assigneeRole?.message}
                    />
                  )}
                />
              </InputWrapper>
            )}

            <InputWrapper>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <ComboBox
                    id="priority"
                    titleText={t('priorityLabel', 'Priority')}
                    placeholder={t('priorityPlaceholder', 'Select priority (optional)')}
                    items={[
                      { id: 'high', label: t('priorityHigh', 'High') },
                      { id: 'medium', label: t('priorityMedium', 'Medium') },
                      { id: 'low', label: t('priorityLow', 'Low') },
                    ]}
                    itemToString={(item) => item?.label ?? ''}
                    selectedItem={
                      field.value
                        ? {
                            id: field.value,
                            label: getPriorityLabel(field.value as Priority, t),
                          }
                        : null
                    }
                    onChange={({ selectedItem }) => {
                      field.onChange(selectedItem?.id ?? undefined);
                    }}
                  />
                )}
              />
            </InputWrapper>
          </div>

          <div className={styles.formSection}>
            <h5 className={styles.formSectionHeader}>{t('rationale', 'Rationale')}</h5>
            <InputWrapper>
              <Controller
                name="rationale"
                control={control}
                render={({ field }) => (
                  <TextArea
                    id="rationale"
                    labelText={t('rationaleLabel', 'Explain briefly why this task is necessary (optional)')}
                    placeholder={t('rationalePlaceholder', 'Add a note here')}
                    rows={4}
                    enableCounter
                    maxLength={100}
                    {...field}
                  />
                )}
              />
            </InputWrapper>
          </div>
        </Form>
      </div>
      <ButtonSet className={styles.bottomButtons}>
        <Button className={styles.button} kind="secondary" onClick={onBack} size="xl">
          {isEditMode ? getCoreTranslation('cancel') : t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" size="xl" onClick={handleSubmit(handleFormSubmission)}>
          {isEditMode ? t('saveTask', 'Save task') : t('addTaskButton', 'Add Task')}
        </Button>
      </ButtonSet>
    </>
  );
};

function InputWrapper({ children }: { children: React.ReactNode }) {
  const isTablet = useLayoutType() === 'tablet';
  return (
    <Layer level={isTablet ? 1 : 0}>
      <div className={styles.field}>{children}</div>
    </Layer>
  );
}

export default AddTaskForm;
