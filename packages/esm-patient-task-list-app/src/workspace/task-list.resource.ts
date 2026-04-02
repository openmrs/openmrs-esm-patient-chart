import { useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { type TFunction } from 'i18next';
import {
  type FetchResponse,
  openmrsFetch,
  restBaseUrl,
  parseDate,
  useDebounce,
  useConfig,
} from '@openmrs/esm-framework';
import { type CarePlan } from '../types';

export interface Assignee {
  uuid: string;
  display?: string;
  type: 'person' | 'role';
}

export type DueDateType = 'THIS_VISIT' | 'NEXT_VISIT' | 'DATE';

export type Priority = 'high' | 'medium' | 'low';

export function getPriorityLabel(priority: Priority, t: TFunction): string {
  const labels: Record<Priority, string> = {
    high: t('priorityHigh', 'High'),
    medium: t('priorityMedium', 'Medium'),
    low: t('priorityLow', 'Low'),
  };
  return labels[priority];
}

export interface Task {
  uuid: string;
  name: string;
  status?: string;
  dueDate?: TaskDueDate;
  createdDate: Date;
  rationale?: string;
  assignee?: Assignee;
  createdBy?: string;
  completed: boolean;
  priority?: Priority;
  systemTaskUuid?: string;
}

export type TaskDueDate = TaskDueDateDate | TaskDueDateVisit;

export type TaskDueDateDate = {
  type: Extract<DueDateType, 'DATE'>;
  date: Date;
};

export type TaskDueDateVisit = {
  type: Extract<DueDateType, 'THIS_VISIT' | 'NEXT_VISIT'>;
  referenceVisitUuid?: string;
  date?: Date;
};

export interface TaskInput {
  name: string;
  dueDate?: TaskDueDate;
  rationale?: string;
  assignee?: Assignee;
  priority?: Priority;
  systemTaskUuid?: string;
}

export interface FHIRCarePlanResponse {
  entry: Array<{
    resource: CarePlan;
  }>;
}

export interface SelectOption {
  id: string;
  label?: string;
}

export interface ProviderSearchResponse {
  results: Array<{
    uuid: string;
    display: string;
  }>;
}

export interface ProviderRoleSearchResponse {
  results: Array<{
    uuid: string;
    name: string;
  }>;
}

const carePlanEndpoint = `${restBaseUrl}/tasks/careplan`;

export function taskListSWRKey(patientUuid: string) {
  return `${carePlanEndpoint}?subject=Patient/${patientUuid}`;
}

export function useTaskList(patientUuid: string) {
  const swrKey = taskListSWRKey(patientUuid);
  const { data, isLoading, error, mutate } = useSWR<{ data: FHIRCarePlanResponse }>(swrKey, openmrsFetch);

  const tasks = useMemo(() => {
    const parsedTasks = data?.data?.entry?.map((entry) => createTaskFromCarePlan(entry.resource)) ?? [];
    const validTasks = parsedTasks.filter((task) => Boolean(task.uuid));
    const activeTasks = validTasks.filter((task) => task.status !== 'cancelled');

    return activeTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const aDue = a.dueDate?.date?.getTime() ?? 0;
      const bDue = b.dueDate?.date?.getTime() ?? 0;

      return aDue - bDue;
    });
  }, [data]);

  return { tasks, isLoading, error, mutate };
}

export function saveTask(patientUuid: string, task: TaskInput) {
  const carePlan = buildCarePlan(patientUuid, task);

  return openmrsFetch(carePlanEndpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(carePlan),
  });
}

export function updateTask(patientUuid: string, task: Task) {
  const carePlan = buildCarePlan(patientUuid, task);

  return openmrsFetch(`${carePlanEndpoint}/${task.uuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: JSON.stringify(carePlan),
  });
}

export function setTaskStatusCompleted(patientUuid: string, task: Task, completed: boolean) {
  const status = completed ? 'completed' : task.status && task.status !== 'completed' ? task.status : 'in-progress';

  return updateTask(patientUuid, {
    ...task,
    completed,
    status,
  });
}

export function useTask(taskUuid: string) {
  const swrKey = taskUuid ? `${carePlanEndpoint}/${taskUuid}` : null;
  const { data, isLoading, error, mutate } = useSWR<{ data: CarePlan }>(swrKey, openmrsFetch);

  const task = useMemo(() => {
    if (!data?.data) {
      return null;
    }
    return createTaskFromCarePlan(data.data);
  }, [data]);

  return { task, isLoading, error, mutate };
}

export function deleteTask(patientUuid: string, task: Task) {
  return updateTask(patientUuid, {
    ...task,
    status: 'cancelled',
  });
}

function createTaskFromCarePlan(carePlan: CarePlan): Task {
  const activity = carePlan?.activity?.[0];
  const detail = activity?.detail;

  const status = detail?.status;

  const performers = detail?.performer ?? [];
  const { dueDate, dueDateType } = extractDueDate(detail);
  const priority = extractPriority(detail);
  const createdBy = carePlan?.author?.display;
  const systemTaskUuid = extractSystemTaskUuid(carePlan.instantiatesCanonical);

  const task: Task = {
    uuid: carePlan.id ?? '',
    name: detail?.description ?? '',
    status,
    createdDate: parseDate(carePlan.created),
    dueDate: {
      type: dueDateType as 'DATE' | 'THIS_VISIT' | 'NEXT_VISIT',
      date: dueDate,
    },
    rationale: carePlan.description ?? undefined,
    createdBy,
    completed: status === 'completed',
    priority,
    systemTaskUuid,
  };

  performers.forEach((performer) => {
    const assignment = parseAssignment(performer);
    if (!assignment) {
      return;
    }
    if (assignment.type === 'provider') {
      task.assignee = assignment.value;
    }
    if (assignment.type === 'providerRole') {
      task.assignee = assignment.value;
    }
  });

  return task;
}

function extractSystemTaskUuid(instantiatesCanonical?: string[]): string | undefined {
  if (!instantiatesCanonical || instantiatesCanonical.length === 0) {
    return undefined;
  }

  for (const reference of instantiatesCanonical) {
    if (reference.startsWith('PlanDefinition/')) {
      return reference.substring('PlanDefinition/'.length);
    }
  }

  return undefined;
}

function buildCarePlan(patientUuid: string, task: Partial<Task>) {
  const performer: Array<fhir.Reference> = [];

  if (task.assignee?.type === 'role' && task.assignee?.uuid) {
    performer.push({
      reference: `PractitionerRole/${task.assignee.uuid}`,
      display: task.assignee.display,
    });
  } else if (task.assignee?.uuid) {
    performer.push({
      reference: `Practitioner/${task.assignee.uuid}`,
      display: task.assignee.display,
    });
  }

  const detail: fhir.CarePlanActivityDetail = {
    status: task.status ?? 'not-started',
    description: task.name,
  };

  if (performer.length > 0) {
    detail.performer = performer;
  }

  // Handle due date. Due date is stored as scheduledPeriod. The type of visit is stored
  // using an activity-dueKind extension. For visit-based due dates, the visit UUID is stored in an
  // encounter-associatedEncounter extension.
  detail.extension = detail.extension || [];

  if (task.dueDate?.type === 'THIS_VISIT' || task.dueDate?.type === 'NEXT_VISIT') {
    // Visit-based types: use scheduledPeriod (end date set server-side if visit ended)
    detail.scheduledPeriod = {};

    detail.extension.push({
      url: 'http://openmrs.org/fhir/StructureDefinition/activity-dueKind',
      valueCode: task.dueDate?.type === 'THIS_VISIT' ? 'this-visit' : 'next-visit',
    });

    if (task.dueDate?.referenceVisitUuid) {
      detail.extension.push({
        url: 'http://hl7.org/fhir/StructureDefinition/encounter-associatedEncounter',
        valueReference: {
          reference: `Encounter/${task.dueDate.referenceVisitUuid}`,
        },
      });
    }
  } else if (task.dueDate?.type === 'DATE' && task.dueDate?.date) {
    detail.scheduledPeriod = {
      end: task.dueDate.date.toISOString(),
    };

    detail.extension.push({
      url: 'http://openmrs.org/fhir/StructureDefinition/activity-dueKind',
      valueCode: 'date',
    });
  }

  // Add priority extension if set
  if (task.priority) {
    detail.extension.push({
      url: 'http://openmrs.org/fhir/StructureDefinition/activity-priority',
      valueCode: task.priority,
    });
  }

  const carePlan: CarePlan = {
    resourceType: 'CarePlan',
    status: task.completed ? 'completed' : 'active',
    intent: 'plan',
    description: task.rationale,
    subject: {
      reference: `Patient/${patientUuid}`,
    },
    activity: [
      {
        detail,
      },
    ],
  };

  if (task.uuid) {
    carePlan.id = task.uuid;
  }

  if (task.systemTaskUuid) {
    carePlan.instantiatesCanonical = [`PlanDefinition/${task.systemTaskUuid}`];
  }

  return carePlan;
}

function parseAssignment(
  performer: fhir.Reference,
): { type: 'provider'; value: Assignee } | { type: 'providerRole'; value: Assignee } | undefined {
  if (!performer) {
    return undefined;
  }

  const reference = performer.reference ?? '';
  const [resourceType, identifier] = reference.split('/');

  if (resourceType === 'Practitioner' && identifier) {
    return {
      type: 'provider',
      value: {
        uuid: identifier,
        display: performer.display ?? undefined,
        type: 'person',
      },
    };
  }

  if (resourceType === 'PractitionerRole' && identifier) {
    return {
      type: 'providerRole',
      value: {
        uuid: identifier,
        display: performer.display ?? undefined,
        type: 'role',
      },
    };
  }

  console.warn('Unknown performer type', performer);
  return null;
}

function extractDueDate(detail?: fhir.CarePlanActivityDetail): {
  dueDate?: Date;
  dueDateCreatedDate?: Date;
  dueDateType?: DueDateType;
} {
  if (!detail) {
    return {};
  }

  // Read due date type from activity-dueKind extension
  let dueDateType: DueDateType | undefined;
  let visitUuid: string | undefined;

  if (detail.extension) {
    for (const ext of detail.extension) {
      if (ext.url === 'http://openmrs.org/fhir/StructureDefinition/activity-dueKind') {
        const value = (ext as any).valueCode || (ext as any).valueString;
        if (value === 'this-visit') {
          dueDateType = 'THIS_VISIT';
        } else if (value === 'next-visit') {
          dueDateType = 'NEXT_VISIT';
        } else if (value === 'date') {
          dueDateType = 'DATE';
        }
      } else if (ext.url === 'http://hl7.org/fhir/StructureDefinition/encounter-associatedEncounter') {
        const ref = (ext as any).valueReference?.reference;
        if (ref && ref.startsWith('Encounter/')) {
          visitUuid = ref.substring('Encounter/'.length);
        }
      }
    }
  }

  // Read due date from scheduledPeriod.end (always present if date is known)
  let dueDate: string | undefined;
  if (detail.scheduledPeriod?.end) {
    dueDate = detail.scheduledPeriod.end;
    // If no dueKind extension was found but we have an end date, assume DATE type
    if (!dueDateType) {
      dueDateType = 'DATE';
    }
  }

  // For visit-based types, dueDate will be null/undefined if visit hasn't ended
  // For DATE type, dueDate will contain the actual date

  return {
    dueDate: dueDate ? parseDate(dueDate) : undefined,
    dueDateType,
  };
}

function extractPriority(detail?: fhir.CarePlanActivityDetail): Priority | undefined {
  if (!detail?.extension) {
    return undefined;
  }

  for (const ext of detail.extension) {
    if (ext.url === 'http://openmrs.org/fhir/StructureDefinition/activity-priority') {
      const value = (ext as any).valueCode || (ext as any).valueString;
      if (value === 'high' || value === 'medium' || value === 'low') {
        return value;
      }
    }
  }

  return undefined;
}

export function useFetchProviders() {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce(query, 300);
  const url =
    debouncedQuery.length < 2
      ? null
      : `${restBaseUrl}/provider?q=${encodeURIComponent(debouncedQuery)}&v=custom:(uuid,display)`;
  const { data, isLoading, error } = useSWR<FetchResponse<ProviderSearchResponse>>(url, openmrsFetch);

  return {
    providers: data?.data?.results ?? [],
    setProviderQuery: setQuery,
    isLoading,
    error,
  };
}

export function useProviderRoles() {
  const { allowAssigningProviderRole } = useConfig();
  const url = allowAssigningProviderRole ? `${restBaseUrl}/providerrole?v=custom:(uuid,name)` : null;
  const response = useSWRImmutable<FetchResponse<ProviderRoleSearchResponse>>(url, openmrsFetch);
  const results = response?.data?.data?.results ?? [];
  return results.map((result) => ({
    id: result.uuid,
    label: result.name,
  }));
}

export function useReferenceVisit(dueDateType: string, patientUuid: string) {
  const referenceVisitUrl =
    dueDateType === 'NEXT_VISIT'
      ? `${restBaseUrl}/visit?patient=${patientUuid}&v=custom:(uuid)&includeInactive=true&limit=1`
      : null;
  const {
    data: referenceVisitResponse,
    isLoading: isReferenceVisitLoading,
    error: referenceVisitError,
  } = useSWR<FetchResponse<{ results: Array<{ uuid: string }> }>>(referenceVisitUrl, openmrsFetch);
  return {
    data: referenceVisitResponse?.data,
    isLoading: isReferenceVisitLoading,
    error: referenceVisitError,
  };
}

// PlanDefinition types for system tasks
export interface PlanDefinition {
  resourceType: 'PlanDefinition';
  id: string;
  name?: string;
  title?: string;
  status?: string;
  description?: string;
  action?: Array<{
    title?: string;
    reason?: Array<{ text?: string }>;
    participant?: Array<{
      role?: { coding?: Array<{ code?: string; display?: string }> };
    }>;
    extension?: Array<{
      url: string;
      valueCode?: string;
    }>;
  }>;
}

export interface FHIRPlanDefinitionBundle {
  resourceType: 'Bundle';
  entry?: Array<{
    resource: PlanDefinition;
  }>;
}

export interface SystemTask {
  uuid: string;
  name: string;
  title: string;
  description?: string;
  priority?: Priority;
  defaultAssigneeRoleUuid?: string;
  defaultAssigneeRoleDisplay?: string;
  rationale?: string;
}

const fhirBaseUrl = '/ws/fhir2/R4';

function planDefinitionToSystemTask(pd: PlanDefinition): SystemTask {
  const action = pd.action?.[0];

  // Extract priority from action extension
  let priority: Priority | undefined;
  if (action?.extension) {
    for (const ext of action.extension) {
      if (ext.url === 'http://openmrs.org/fhir/StructureDefinition/activity-priority') {
        const value = ext.valueCode;
        if (value === 'high' || value === 'medium' || value === 'low') {
          priority = value;
        }
      }
    }
  }

  // Extract default assignee role from action participant
  let defaultAssigneeRoleUuid: string | undefined;
  let defaultAssigneeRoleDisplay: string | undefined;
  if (action?.participant?.[0]?.role?.coding?.[0]) {
    const coding = action.participant[0].role.coding[0];
    defaultAssigneeRoleUuid = coding.code;
    defaultAssigneeRoleDisplay = coding.display;
  }

  // Extract rationale from action reason
  const rationale = action?.reason?.[0]?.text;

  return {
    uuid: pd.id,
    name: pd.name ?? '',
    title: pd.title ?? pd.name ?? '',
    description: pd.description,
    priority,
    defaultAssigneeRoleUuid,
    defaultAssigneeRoleDisplay,
    rationale,
  };
}

export function useSystemTasks() {
  const url = `${fhirBaseUrl}/PlanDefinition?status=active`;
  const { data, isLoading, error } = useSWRImmutable<FetchResponse<FHIRPlanDefinitionBundle>>(url, openmrsFetch);

  const systemTasks = useMemo(() => {
    const entries = data?.data?.entry ?? [];
    return entries.map((entry) => planDefinitionToSystemTask(entry.resource));
  }, [data]);

  return { systemTasks, isLoading, error };
}
