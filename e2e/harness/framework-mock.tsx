/**
 * A minimal stand-in for `@openmrs/esm-framework`, aliased in by the harness Vite config.
 *
 * The harness renders the real notification components — bell, panel, detail modal, reviewed
 * banner and order form — so the screenshots show the shipped UI. Only the framework seam is
 * faked, so there is no app shell, no import map and no backend to stand up.
 */
import React, { useEffect, useRef, useState } from 'react';
import { type ScenarioName, scenarios } from './fixtures';

export const restBaseUrl = '/ws/rest/v1';
export const fhirBaseUrl = '/ws/fhir2/R4';

const session = {
  authenticated: true,
  sessionId: 'harness-session',
  sessionLocation: { uuid: 'location-uuid-outpatient', display: 'Outpatient Clinic', links: [] },
  currentProvider: { uuid: 'provider-uuid-1', identifier: 'PROV-1' },
  user: {
    uuid: 'user-uuid-1',
    display: 'sarah',
    person: { uuid: 'person-uuid-1', display: 'Dr. Sarah Smith' },
  },
};

// `?disabled=1` flips the master switch, so the spec can prove the feature disappears cleanly.
const smartNotificationsEnabled = !new URLSearchParams(window.location.search).has('disabled');

const config = {
  smartNotifications: {
    enabled: smartNotificationsEnabled,
    notifyOnAbnormalNonCritical: false,
    locationScoped: true,
    pollingIntervalMs: 30000,
  },
  showReferenceNumberField: true,
  labTestsWithOrderReasons: [],
  orders: { labOrderTypeUuid: 'lab-order-type-uuid', labOrderableConcepts: [] },
  additionalTestOrderTypes: [],
};

export const useSession = () => session;
export const useConfig = () => config;
export const useLayoutType = () => 'small-desktop';
export const isDesktop = () => true;

export function useOnClickOutside<T extends HTMLElement>(handler: (event: MouseEvent) => void, active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!active) {
      return;
    }
    const listener = (event: MouseEvent) => {
      if (ref.current && event.target instanceof Node && ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    window.addEventListener('mousedown', listener);
    return () => window.removeEventListener('mousedown', listener);
  }, [handler, active]);
  return ref;
}

export const navigate = ({ to }: { to: string }) => {
  window.dispatchEvent(new CustomEvent('harness:navigate', { detail: to }));
};

/**
 * The harness renders modals inline (see `main.tsx`) rather than through the app shell, so
 * `showModal` just publishes the request and hands back a disposer.
 */
export const showModal = (name: string, props: Record<string, unknown>) => {
  window.dispatchEvent(new CustomEvent('harness:show-modal', { detail: { name, props } }));
  return () => window.dispatchEvent(new CustomEvent('harness:close-modal'));
};

export const showSnackbar = (snackbar: Record<string, unknown>) => {
  window.dispatchEvent(new CustomEvent('harness:snackbar', { detail: snackbar }));
};

export function getPatientName(patient: fhir.Patient): string {
  const name = patient?.name?.[0];
  if (!name) {
    return '';
  }
  return [name.given?.join(' '), name.family].filter(Boolean).join(' ');
}

export function age(birthDate: string): string {
  const years = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${years} yrs`;
}

export const parseDate = (value: string) => new Date(value);

export const formatDate = (date: Date) => date.toLocaleDateString('en-GB');

export const formatDatetime = (date: Date) => date.toLocaleString('en-GB');

export const toOmrsIsoString = (date: Date) => date.toISOString();

/**
 * Serves the scenario fixtures so the real resource hook does its real work — fetching orders and
 * observations, joining them, and running the classification rule — instead of being stubbed out.
 */
export function openmrsFetch(url: string) {
  const scenario = scenarios[(new URLSearchParams(window.location.search).get('scenario') as ScenarioName) ?? 'single'];

  if (url.includes('/order?')) {
    return Promise.resolve({ data: { results: scenario.orders } });
  }
  if (url.includes('/Observation')) {
    return Promise.resolve({ data: { entry: scenario.observations } });
  }
  if (url.includes('/conceptreferencerange')) {
    // The fixtures carry observation-level ranges, which take precedence anyway.
    return Promise.resolve({ data: { results: [] } });
  }
  return Promise.resolve({ data: { results: [] } });
}

export const ExtensionSlot: React.FC<{ name: string }> = () => null;

export const OpenmrsDatePicker: React.FC<{ labelText: string; id: string }> = ({ labelText, id }) => (
  <div>
    <label htmlFor={id}>{labelText}</label>
    <input id={id} type="date" />
  </div>
);

// --- store primitives -------------------------------------------------------------------------
// A tiny synchronous store, API-compatible with the slice of zustand the components use.

const stores = new Map<string, ReturnType<typeof createStore>>();

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    setState: (partial: Partial<T>) => {
      state = { ...state, ...partial };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function createGlobalStore<T>(name: string, initial: T) {
  if (!stores.has(name)) {
    stores.set(name, createStore(initial));
  }
  return stores.get(name) as ReturnType<typeof createStore<T>>;
}

export function getGlobalStore<T>(name: string, fallback: T) {
  return createGlobalStore(name, fallback);
}

export function useStore<T>(store: ReturnType<typeof createStore<T>>): T {
  const [state, setState] = useState(store.getState());
  useEffect(() => store.subscribe(() => setState(store.getState())), [store]);
  return state;
}

// --- icons ------------------------------------------------------------------------------------

const icon = (path: React.ReactNode) =>
  function Icon({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
    return (
      <svg fill="currentColor" height={size} viewBox="0 0 32 32" width={size} {...props}>
        {path}
      </svg>
    );
  };

export const ChevronRightIcon = icon(<path d="M22 16L12 26 10.6 24.6 19.2 16 10.6 7.4 12 6z" />);
export const CloseIcon = icon(
  <path d="M17.4 16L24 9.4 22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6z" />,
);
