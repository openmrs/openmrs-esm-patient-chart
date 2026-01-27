/**
 * Mock for @openmrs/esm-framework used in tests.
 */

export const restBaseUrl = '/ws/rest/v1';
export const fhirBaseUrl = '/ws/fhir2/R4/';

export const createGlobalStore = function () {
  return {
    getState: function () {
      return {};
    },
    setState: function () {},
    subscribe: function () {
      return function () {};
    },
  };
};

export const showSnackbar = function () {};
export const showModal = function () {
  return { close: function () {} };
};

export const openmrsFetch = function () {
  return Promise.resolve({ data: {} });
};

export const getConfigStore = function () {
  return {
    getState: function () {
      return { config: {} };
    },
    subscribe: function () {
      return function () {};
    },
  };
};

export const getSessionStore = function () {
  return {
    getState: function () {
      return { session: {} };
    },
    subscribe: function () {
      return function () {};
    },
  };
};

export const getSynchronizationItems = function () {
  return Promise.resolve([]);
};

export const getFullSynchronizationItems = function () {
  return Promise.resolve([]);
};

export const queueSynchronizationItem = function () {
  return Promise.resolve();
};

export const messageOmrsServiceWorker = function () {
  return Promise.resolve();
};

export const defineConfigSchema = function () {};

export const Type = {
  String: 'String',
  Number: 'Number',
  Boolean: 'Boolean',
  Array: 'Array',
  Object: 'Object',
  UUID: 'UUID',
  ConceptUuid: 'ConceptUuid',
};

export const validator = function (fn) {
  return fn;
};

export function DefaultWorkspaceProps() {}
