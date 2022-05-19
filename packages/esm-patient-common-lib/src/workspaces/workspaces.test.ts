import { registerExtension } from '@openmrs/esm-framework';
import { cancelPrompt, getWorkspaceStore, launchPatientWorkspace, registerWorkspace, resetWorkspaceStore } from '.';

const mockExtensionRegistry = {};

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    registerExtension: (ext) => {
      mockExtensionRegistry[ext.name] = ext;
    },
    getExtensionRegistration: (name) => mockExtensionRegistry[name],
    translateFrom: (module, key, defaultValue, options) => defaultValue,
  };
});

describe('workspace system', () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  test('registering, launching, and closing a workspace', () => {
    const store = getWorkspaceStore();
    registerWorkspace({ name: 'allergies', title: 'Allergies', load: jest.fn() });
    launchPatientWorkspace('allergies', { foo: true });
    expect(store.getState().openWorkspaces.length).toEqual(1);
    const allergies = store.getState().openWorkspaces[0];
    expect(allergies.name).toBe('allergies');
    expect(allergies.additionalProps['foo']).toBe(true);
    allergies.closeWorkspace();
    expect(store.getState().openWorkspaces.length).toEqual(0);
  });
  test('updates workspace title when provided with `workspaceTitle` prop', () => {
    const store = getWorkspaceStore();
    registerWorkspace({ name: 'POC HIV Form', title: 'Clinical Form', load: jest.fn() });
    launchPatientWorkspace('POC HIV Form', { workspaceTitle: 'POC HIV Form' });

    expect(store.getState().openWorkspaces.length).toEqual(1);

    const POCHIVForm = store.getState().openWorkspaces[0];
    expect(POCHIVForm.name).toBe('POC HIV Form');
    expect(POCHIVForm.additionalProps['workspaceTitle']).toBe('POC HIV Form');

    launchPatientWorkspace('POC HIV Form', { workspaceTitle: 'POC HIV Form Updated' });

    expect(POCHIVForm.additionalProps['workspaceTitle']).toBe('POC HIV Form Updated');
    expect(store.getState().openWorkspaces.length).toEqual(1);

    POCHIVForm.closeWorkspace();

    expect(store.getState().openWorkspaces.length).toEqual(0);
  });

  test('coexisting and non-coexisting workspaces', () => {
    const store = getWorkspaceStore();
    // conditions and form-entry are of the same (default) type, so they will not coexist.
    // order-meds is of a different type, so it will open on top of the others.
    registerWorkspace({ name: 'conditions', title: 'Conditions', load: jest.fn() });
    registerWorkspace({ name: 'form-entry', title: 'Some Form', load: jest.fn() });
    registerWorkspace({ name: 'order-meds', title: 'Order Medications', load: jest.fn(), type: 'order' });
    // Test opening the same workspace twice--should be a no-op
    launchPatientWorkspace('conditions');
    launchPatientWorkspace('conditions');
    expect(store.getState().openWorkspaces.length).toEqual(1);
    // Test opening a workspace of the same type--should require confirmation and then replace
    launchPatientWorkspace('form-entry', { foo: true });
    expect(store.getState().openWorkspaces.length).toEqual(1);
    expect(store.getState().openWorkspaces[0].name).toBe('conditions');
    expect(store.getState().prompt.title).toMatch(/active form open/);
    store.getState().prompt.onConfirm();
    expect(store.getState().prompt).toBeNull();
    expect(store.getState().openWorkspaces.length).toEqual(1);
    expect(store.getState().openWorkspaces[0].name).toBe('form-entry');
    expect(store.getState().openWorkspaces[0].additionalProps['foo']).toBe(true);
    // Test opening a workspace of a different type--should open directly
    launchPatientWorkspace('order-meds');
    expect(store.getState().openWorkspaces.length).toEqual(2);
    expect(store.getState().openWorkspaces[0].name).toBe('order-meds');
    expect(store.getState().openWorkspaces[1].name).toBe('form-entry');
    // Test going through confirmation flow while order-meds is open
    // Changing the form workspace shouldn't destroy the order-meds workspace
    launchPatientWorkspace('conditions');
    expect(store.getState().openWorkspaces.length).toEqual(2);
    expect(store.getState().openWorkspaces[0].name).toBe('order-meds');
    expect(store.getState().openWorkspaces[1].name).toBe('form-entry');
    expect(store.getState().prompt.title).toMatch(/active form open/);
    cancelPrompt(); // should leave same workspaces intact
    expect(store.getState().openWorkspaces.length).toEqual(2);
    expect(store.getState().openWorkspaces[0].name).toBe('order-meds');
    expect(store.getState().openWorkspaces[1].name).toBe('form-entry');
    expect(store.getState().prompt).toBeNull();
    launchPatientWorkspace('conditions');
    store.getState().prompt.onConfirm();
    expect(store.getState().openWorkspaces.length).toEqual(2);
    expect(store.getState().openWorkspaces[0].name).toBe('conditions');
    expect(store.getState().openWorkspaces[1].name).toBe('order-meds');
    store.getState().openWorkspaces[0].closeWorkspace();
    expect(store.getState().openWorkspaces.length).toEqual(1);
    expect(store.getState().openWorkspaces[0].name).toBe('order-meds');
  });

  test('respects promptBeforeClosing function', () => {
    const store = getWorkspaceStore();
    registerWorkspace({ name: 'hiv', title: 'HIV', load: jest.fn() });
    registerWorkspace({ name: 'diabetes', title: 'Diabetes', load: jest.fn() });
    launchPatientWorkspace('hiv');
    store.getState().openWorkspaces[0].promptBeforeClosing(() => false);
    launchPatientWorkspace('diabetes');
    expect(store.getState().prompt).toBeNull();
    expect(store.getState().openWorkspaces[0].name).toBe('diabetes');
    store.getState().openWorkspaces[0].promptBeforeClosing(() => true);
    launchPatientWorkspace('hiv');
    expect(store.getState().openWorkspaces[0].name).toBe('diabetes');
    expect(store.getState().prompt.title).toMatch(/active form open/);
    store.getState().prompt.onConfirm();
    expect(store.getState().openWorkspaces[0].name).toBe('hiv');
  });

  test('is compatible with workspaces registered as extensions', () => {
    const store = getWorkspaceStore();
    registerExtension({
      name: 'lab-results',
      moduleName: '@openmrs/esm-lab-results-app',
      load: jest.fn(),
      meta: { title: 'Lab Results', screenSize: 'maximized' },
    });
    launchPatientWorkspace('lab-results', { foo: true });
    expect(store.getState().openWorkspaces.length).toEqual(1);
    const workspace = store.getState().openWorkspaces[0];
    expect(workspace.name).toEqual('lab-results');
    expect(workspace.additionalProps['foo']).toBe(true);
    expect(workspace.title).toBe('Lab Results');
    expect(workspace.preferredWindowSize).toBe('maximized');
  });

  test('launching unregistered workspace throws an error', () => {
    const store = getWorkspaceStore();
    expect(() => launchPatientWorkspace('test-results')).toThrowError(/test-results.*registered/i);
  });

  test('respects promptBeforeClosing function before closing workspace, with unsaved changes', () => {
    const store = getWorkspaceStore();
    registerWorkspace({ name: 'hiv', title: 'HIV', load: jest.fn() });
    launchPatientWorkspace('hiv');
    store.getState().openWorkspaces[0].promptBeforeClosing(() => true);
    store.getState().openWorkspaces[0].closeWorkspace(false);
    expect(store.getState().prompt.title).toBe('Unsaved Changes');
    expect(store.getState().prompt.body).toBe(
      'You have unsaved changes in the side panel. Do you want to discard these changes?',
    );
    expect(store.getState().prompt.confirmText).toBe('Discard');
    store.getState().prompt.onConfirm();
    expect(store.getState().openWorkspaces.length).toBe(0);
  });
});
