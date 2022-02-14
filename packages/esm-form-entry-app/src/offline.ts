import {
  generateOfflineUuid,
  getSynchronizationItems,
  isOfflineUuid,
  messageOmrsServiceWorker,
  openmrsFetch,
  QueueItemDescriptor,
  queueSynchronizationItem,
  setupOfflineSync,
  subscribeNetworkRequestFailed,
  subscribePrecacheStaticDependencies,
  Visit,
} from '@openmrs/esm-framework';

export interface QueuedEncounterRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
}

const syncType = 'form-entry-encounters';

export function setupEncounterRequestInterceptors() {
  subscribeNetworkRequestFailed(async (data) => {
    const createEncounterPattern = /.+\/ws\/rest\/v1\/encounter$/;
    const updateEncounterPattern = /.+\/ws\/rest\/v1\/encounter\/(.+)/;

    if (data.request.method === 'POST') {
      if (createEncounterPattern.test(data.request.url)) {
        const { uuid } = JSON.parse(data.request.headers['x-omrs-offline-response-body']);
        const encounterPost = JSON.parse(data.request.body);
        const body = { ...encounterPost, uuid };
        addAllOfflineUuids(body);

        await queueEncounterRequest({
          url: data.request.url,
          method: data.request.method,
          headers: data.request.headers,
          body,
        });
      } else if (updateEncounterPattern.test(data.request.url)) {
        const uuid = updateEncounterPattern.exec(data.request.url)[1];
        const encounterRequest = await findQueuedEncounterRequest(uuid);
        const existingEncounter = encounterRequest.body;
        const updatedEncounter = JSON.parse(data.request.body);
        const newEncounter = mergeEncounterUpdate(existingEncounter, updatedEncounter);
        encounterRequest.body = newEncounter;
        await queueEncounterRequest(encounterRequest);
      }
    }
  });
}

export function setupOfflineDataSourcePrecaching() {
  subscribePrecacheStaticDependencies(async () => {
    const urlsToCache = [
      '/ws/rest/v1/location?q=&v=custom:(uuid,display)',
      '/ws/rest/v1/provider?q=&v=custom:(uuid,display,person:(uuid))',
    ];

    await Promise.all(
      urlsToCache.map(async (url) => {
        await messageOmrsServiceWorker({
          type: 'registerDynamicRoute',
          pattern: '.+' + url,
        });
        await openmrsFetch(url);
      }),
    );
  });
}

export async function setupOfflineEncounterSync() {
  setupOfflineSync<QueuedEncounterRequest>(syncType, ['visit'], async (item, options) => {
    const associatedOfflineVisit: Visit | undefined = options.dependencies[0];
    const body = { ...item.body };
    removeAllOfflineUuids(body);

    setUuidObjectToString(body, 'patient');
    setUuidObjectToString(body, 'form');
    setUuidObjectToString(body, 'location');

    for (const obs of body.obs || []) {
      setUuidObjectToString(obs, 'concept');

      for (const groupMember of obs.groupMembers || []) {
        setUuidObjectToString(groupMember, 'concept');
      }
    }

    for (const provider of body.encounterProviders || []) {
      setUuidObjectToString(provider, 'provider');
    }

    if (associatedOfflineVisit && body.visit === associatedOfflineVisit.id && !body.encounterDatetime) {
      body.encounterDatetime = associatedOfflineVisit.stopDatetime;
    }

    const res = await fetch(item.url, {
      method: item.method,
      headers: item.headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to synchronize the form encounter ${JSON.stringify(body)}. Error: ${await res.text()}`);
    }
  });
}

async function queueEncounterRequest(item: QueuedEncounterRequest) {
  const descriptor: QueueItemDescriptor = {
    id: item.body.uuid,
    displayName: 'Patient form',
    patientUuid: item.body.patient,
    dependencies: [
      {
        type: 'visit',
        id: item.body.visit,
      },
    ],
  };
  await queueSynchronizationItem(syncType, item, descriptor);
}

export async function getOfflineEncounterForForm(uuid: string) {
  const item = await findQueuedEncounterRequest(uuid);
  const body = item && item.body;

  if (!body) {
    throw new Error(`No offline encounter with the UUID ${uuid} exists.`);
  }

  setUuidStringToObject(body, 'patient');
  setUuidStringToObject(body, 'form');
  setUuidStringToObject(body, 'location');

  for (const obs of body.obs || []) {
    setUuidStringToObject(obs, 'concept');

    for (const groupMember of obs.groupMembers || []) {
      setUuidStringToObject(groupMember, 'concept');
    }
  }

  for (const provider of body.encounterProviders || []) {
    setUuidStringToObject(provider, 'provider');
  }

  return body;
}

function setUuidStringToObject(obj: any, key: string) {
  if (typeof obj[key] === 'string') {
    obj[key] = { uuid: obj[key] } as any;
  }
}

function setUuidObjectToString(obj: any, key: string) {
  if (typeof obj[key] === 'object' && typeof obj[key].uuid === 'string') {
    obj[key] = obj[key].uuid;
  }
}

async function findQueuedEncounterRequest(uuid: string) {
  const allEncounters = await getSynchronizationItems<QueuedEncounterRequest>(syncType);
  return allEncounters.find((encounter) => encounter.body.uuid === uuid);
}

/**
 * Recursively walks the specified object and adds `uuid` keys to objects in the tree which don't
 * have a UUID yet. The new UUID will be set to a random offline UUID, meant to uniquely identify
 * the object while working with it in offline-mode.
 *
 * This is introduced to allow diffing of objects which, in offline-mode, don't get assigned a
 * unique identifier by the backend.
 *
 * **Note:** Mutates the given object.
 */
function addAllOfflineUuids(obj: any) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const value of obj) {
        addAllOfflineUuids(value);
      }
    } else if (obj.uuid === undefined) {
      obj.uuid = generateOfflineUuid();
    }

    for (const value of Object.values(obj)) {
      addAllOfflineUuids(value);
    }
  }
}

/**
 * Recursively walks the specified object and removes any `uuid` keys from objects which have an
 * offline UUID value.
 *
 * This is supposed to be called to clean offline data and convert it back into a format which can be
 * sent to the backend.
 *
 * **Note:** Mutates the given object.
 */
function removeAllOfflineUuids(obj: any) {
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const value of obj) {
        removeAllOfflineUuids(value);
      }
    } else if (typeof obj.uuid === 'string' && isOfflineUuid(obj.uuid)) {
      delete obj.uuid;
    }

    for (const value of Object.values(obj)) {
      removeAllOfflineUuids(value);
    }
  }
}

/**
 * Given an `original`, previous encounter object (which was typically stored offline) and a new,
 * partial, updated encounter (produced by the form engine based on the original encounter),
 * merges the values of the updated encounter into the original encounter such that the original
 * encounter can be sent to the backend (with a POST/Create API call).
 *
 * Generally, the offline editing flow of encounters works like this:
 * 1) User creates a new encounter while offline. The encounter is persisted locally, waiting to be synced.
 * 2) User edits the encounter. The MF starts the form engine and passes the locally persisted encounter.
 *    The form engine prefills the inputs with the encounter's data.
 * 3) User edits and submits the encounter. The form engine makes a network call with **the updated data only**.
 *    -> We must merge that updated data into our existing encounter to be able to post it when reconnecting to the
 *       network.
 *
 * Merging requires the original encounter's sub-resources to have a unique identifier (otherwise they couldn't be
 * matched with the updated values).
 * This is achieved using the {@link addAllOfflineUuids} function here.
 */
function mergeEncounterUpdate(original: any, updated: any) {
  // Top-level encounter data can simply be merged using the spread operator.
  // `obs` and `orders` are more difficult because data here can be added, updated and removed.
  //
  // Generally:
  // - New sub-resources don't have an (offline-)UUID.
  // - Updated sub-resources *have* an (offline)-UUID and can be matched with the original.
  // - Deleted sub-resources have a state (`voided` for observations, `action` for orders).
  const obs = mergeObservations(original.obs, updated.obs);
  const orders = mergeOrders(original.orders, updated.orders);
  const result = {
    ...original,
    ...updated,
    obs,
    orders,
  };

  addAllOfflineUuids(result);
  return result;
}

function mergeObservations(original: Array<any>, updated: Array<any>) {
  // An observation can have "nested" observation values in the groupMembers field.
  // If present, these values must also be merged recursively.
  const newObservations = updated.filter((obs) => !obs.uuid);
  const updatedObservations = original.map((originalObs) => {
    const updatedObs = updated.find((obs) => obs.uuid === originalObs.uuid);
    if (!updatedObs) {
      return originalObs;
    }

    if (Array.isArray(originalObs.groupMembers) && Array.isArray(updatedObs.groupMembers)) {
      return {
        ...originalObs,
        ...updatedObs,
        groupMembers: mergeObservations(originalObs.groupMembers, updatedObs.groupMembers),
      };
    } else {
      return {
        ...originalObs,
        ...updatedObs,
      };
    }
  });
  return [...newObservations, ...updatedObservations].filter((obs) => !obs.voided);
}

function mergeOrders(original: Array<any>, updated: Array<any>) {
  const newOrders = updated.filter((order) => !order.uuid);
  const updatedOrders = original.map((originalOrder) => ({
    ...originalOrder,
    ...updated.find((updatedOrder) => updatedOrder.uuid === originalOrder.uuid),
  }));
  return [...newOrders, ...updatedOrders].filter(
    (order) => order.action.toLowerCase() === 'new' || order.action.toLowerCase() === 'revise',
  );
}
