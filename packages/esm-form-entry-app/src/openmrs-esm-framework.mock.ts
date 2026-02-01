/**
 * Mock for @openmrs/esm-framework used in Angular tests.
 *
 * Note: We can't use @openmrs/esm-framework/mock.tsx because it uses
 * React components and Jest/Vitest APIs which are incompatible with
 * Angular's Karma/Jasmine test setup.
 */

export const restBaseUrl = '/ws/rest/v1';
export const fhirBaseUrl = '/ws/fhir2/R4/';

export function createGlobalStore<T>(_name: string, _initialState: T) {
  let state = _initialState;
  const subscribers: Array<(state: T) => void> = [];
  return {
    getState: () => state,
    setState: (newState: T) => {
      state = newState;
      subscribers.forEach((fn) => fn(state));
    },
    subscribe: (fn: (state: T) => void) => {
      subscribers.push(fn);
      return () => {
        const index = subscribers.indexOf(fn);
        if (index > -1) subscribers.splice(index, 1);
      };
    },
  };
}

export const showSnackbar = (_options: any) => {};
export const showModal = (_name: string, _props?: any) => () => {};

export interface FetchResponse<T = any> {
  data: T;
  ok: boolean;
  status: number;
  statusText: string;
}

export interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export function openmrsFetch<T = any>(_url: string, _options?: any): Promise<FetchResponse<T>> {
  return Promise.resolve({ data: {} as T, ok: true, status: 200, statusText: 'OK' });
}

export interface OpenmrsResource {
  uuid: string;
  display?: string;
  links?: Array<{ rel: string; uri: string }>;
}

export type ConfigObject = Record<string, any>;

export interface Session {
  authenticated: boolean;
  user?: any;
  currentProvider?: any;
  sessionLocation?: any;
}

export const getConfigStore = (_name?: string) => ({
  getState: () => ({ loaded: true, config: {} }),
  subscribe: (fn: (state: any) => void) => {
    fn({ loaded: true, config: {} });
    return () => {};
  },
});

export const getSessionStore = () => ({
  getState: () => ({ loaded: true, session: {} as Session }),
  subscribe: (fn: (state: any) => void) => {
    fn({ loaded: true, session: {} as Session });
    return () => {};
  },
});

export interface SyncItem<T = any> {
  id: string;
  content: T;
  createdOn: Date;
  descriptor: any;
}

export const getSynchronizationItems = <T>(_key: string): Promise<T[]> => Promise.resolve([]);
export const getFullSynchronizationItems = <T>(_key: string): Promise<Array<SyncItem<T>>> => Promise.resolve([]);
export const queueSynchronizationItem = <T>(_key: string, _content: T, _options?: any): Promise<void> =>
  Promise.resolve();
export const messageOmrsServiceWorker = () => Promise.resolve();

export const defineConfigSchema = () => {};

export const Type = {
  String: 'String',
  Number: 'Number',
  Boolean: 'Boolean',
  Array: 'Array',
  Object: 'Object',
  UUID: 'UUID',
  ConceptUuid: 'ConceptUuid',
};

export const validator = <T>(fn: T): T => fn;

export interface DefaultWorkspaceProps {
  closeWorkspace: (options?: object) => void;
  promptBeforeClosing: (testFcn: () => boolean) => void;
  closeWorkspaceWithSavedChanges: (options?: object) => void;
}
