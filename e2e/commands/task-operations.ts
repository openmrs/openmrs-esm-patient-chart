import { type APIRequestContext, expect } from '@playwright/test';

const carePlanEndpoint = 'tasks/careplan';

export interface TaskInput {
  name: string;
  status?: string;
  rationale?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface CreatedTask {
  id: string;
  resourceType: string;
  status: string;
}

/**
 * Creates a task (CarePlan) for a patient via the REST API.
 * Use this to set up test data before a spec runs.
 */
export const createTask = async (
  api: APIRequestContext,
  patientUuid: string,
  task: TaskInput,
): Promise<CreatedTask> => {
  const detail: Record<string, unknown> = {
    status: task.status ?? 'not-started',
    description: task.name,
    extension: [],
  };

  if (task.priority) {
    (detail.extension as unknown[]).push({
      url: 'http://openmrs.org/fhir/StructureDefinition/activity-priority',
      valueCode: task.priority,
    });
  }

  const res = await api.post(carePlanEndpoint, {
    data: {
      resourceType: 'CarePlan',
      status: 'active',
      intent: 'plan',
      description: task.rationale,
      subject: {
        reference: `Patient/${patientUuid}`,
      },
      activity: [{ detail }],
    },
    headers: { 'Content-Type': 'application/json' },
  });

  expect(res.ok()).toBeTruthy();
  return res.json();
};

/**
 * Cancels (soft-deletes) a task by setting its status to 'cancelled'.
 */
export const deleteTask = async (api: APIRequestContext, patientUuid: string, taskUuid: string) => {
  await api.put(`${carePlanEndpoint}/${taskUuid}`, {
    data: {
      resourceType: 'CarePlan',
      id: taskUuid,
      status: 'active',
      intent: 'plan',
      subject: { reference: `Patient/${patientUuid}` },
      activity: [{ detail: { status: 'cancelled', description: '' } }],
    },
    headers: { 'Content-Type': 'application/json' },
  });
};
