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
    translateFrom: (module, key, defaultValue, options = {}) => {
      Object.keys(options).forEach((key) => {
        defaultValue = defaultValue.replace(`{{${key}}}`, options[key]);
      });
      return defaultValue;
    },
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

  describe('Testing launchPatientWorkspace', () => {
    it('should launch a workspace', () => {
      const store = getWorkspaceStore();
      registerWorkspace({ name: 'allergies', title: 'Allergies', load: jest.fn() });
      launchPatientWorkspace('allergies', { foo: true });
      expect(store.getState().openWorkspaces.length).toEqual(1);
      const allergies = store.getState().openWorkspaces[0];
      expect(allergies.name).toBe('allergies');
      expect(allergies.additionalProps['foo']).toBe(true);
    });

    test('should update additionalProps when re-opening an already opened form with same name but with different props', () => {
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

    it('should show a modal when a workspace is already open and it cannot hide', () => {
      const store = getWorkspaceStore();
      registerWorkspace({ name: 'allergies', title: 'Allergies', load: jest.fn() });
      launchPatientWorkspace('allergies', { foo: true });
      expect(store.getState().openWorkspaces.length).toEqual(1);
      registerWorkspace({ name: 'conditions', title: 'Conditions', load: jest.fn() });
      launchPatientWorkspace('conditions', { foo: true });
      const prompt = store.getState().prompt;
      expect(prompt).toBeTruthy();
      expect(prompt.title).toMatch('You have unsaved changes');
      expect(prompt.body).toMatch(
        'There are unsaved changes in Allergies. Please save them before opening another form.',
      );
      expect(prompt.confirmText).toMatch('Open anyway');
      prompt.onConfirm();
      expect(store.getState().openWorkspaces.length).toEqual(1);
      const openedWorkspace = store.getState().openWorkspaces[0];
      expect(openedWorkspace.name).toBe('conditions');
      expect(openedWorkspace.name).not.toBe('Allergies');
    });

    it('should not show a modal and open the workspace when a workspace is already open and it can hide, both workspaces being of different type', () => {
      const store = getWorkspaceStore();
      registerWorkspace({
        name: 'allergies',
        title: 'Allergies',
        load: jest.fn(),
        canHide: true,
        type: 'allergies-form',
      });
      launchPatientWorkspace('allergies', { foo: true });
      expect(store.getState().openWorkspaces.length).toEqual(1);
      registerWorkspace({ name: 'conditions', title: 'Conditions', load: jest.fn(), type: 'conditions-form' });
      launchPatientWorkspace('conditions', { foo: true });
      expect(store.getState().openWorkspaces.length).toEqual(2);
      const openedWorkspaces = store.getState().openWorkspaces;
      expect(openedWorkspaces[0].name).toBe('conditions');
      expect(openedWorkspaces[1].name).not.toBe('Allergies');
    });

    it("should show a modal when launching a workspace with type matching the already opened workspace's type and should show the previous opened workspace in front when showing the modal", () => {
      const store = getWorkspaceStore();
      registerWorkspace({
        name: 'allergies',
        title: 'Allergies',
        load: jest.fn(),
        canHide: true,
        type: 'form',
      });
      registerWorkspace({
        name: 'conditions',
        title: 'Conditions',
        load: jest.fn(),
        canHide: true,
        type: 'conditions-form',
      });
      registerWorkspace({
        name: 'vitals',
        title: 'Vitals form',
        load: jest.fn(),
        type: 'form',
      });
      launchPatientWorkspace('allergies');
      launchPatientWorkspace('conditions');
      expect(store.getState().openWorkspaces.length).toEqual(2);
      expect(store.getState().openWorkspaces[0].name).toBe('conditions');
      expect(store.getState().openWorkspaces[1].name).toBe('allergies');
      launchPatientWorkspace('vitals');
      expect(store.getState().openWorkspaces.length).toEqual(2);
      expect(store.getState().openWorkspaces[0].name).toBe('allergies');
      expect(store.getState().openWorkspaces[1].name).toBe('conditions');
      const prompt = store.getState().prompt;
      expect(prompt).toBeTruthy();
      expect(prompt.title).toMatch('You have unsaved changes');
      expect(prompt.body).toMatch(
        'There are unsaved changes in Allergies. Please save them before opening another form.',
      );
      expect(prompt.confirmText).toMatch('Open anyway');
      prompt.onConfirm();
      expect(store.getState().openWorkspaces.length).toEqual(2);
      expect(store.getState().openWorkspaces[0].name).toBe('vitals');
      expect(store.getState().openWorkspaces[1].name).toBe('conditions');
    });

    it("should not show a modal when launching a workspace with type not matching with any already opened workspace's type", () => {
      const store = getWorkspaceStore();
      registerWorkspace({
        name: 'allergies',
        title: 'Allergies',
        load: jest.fn(),
        canHide: true,
        type: 'allergies-form',
      });
      registerWorkspace({
        name: 'conditions',
        title: 'Conditions',
        load: jest.fn(),
        canHide: true,
        type: 'conditions-form',
      });
      registerWorkspace({
        name: 'vitals',
        title: 'Vitals form',
        load: jest.fn(),
        type: 'vitals-form',
      });
      launchPatientWorkspace('allergies');
      launchPatientWorkspace('conditions');
      expect(store.getState().openWorkspaces.length).toEqual(2);
      expect(store.getState().openWorkspaces[0].name).toBe('conditions');
      expect(store.getState().openWorkspaces[1].name).toBe('allergies');
      launchPatientWorkspace('vitals');
      expect(store.getState().openWorkspaces.length).toEqual(3);
      expect(store.getState().openWorkspaces[0].name).toBe('vitals');
      expect(store.getState().openWorkspaces[1].name).toBe('conditions');
      expect(store.getState().openWorkspaces[2].name).toBe('allergies');
      const prompt = store.getState().prompt;
      expect(prompt).toBeFalsy();
    });

    it('should show 2 modals if both, workspace with `canHide=false` and workspace type matches with already opened workspace', () => {
      const store = getWorkspaceStore();
      registerWorkspace({
        name: 'allergies',
        title: 'Allergies',
        load: jest.fn(),
        canHide: true,
        type: 'form',
      });
      registerWorkspace({
        name: 'attachments',
        title: 'Attachements',
        load: jest.fn(),
        canHide: true,
        type: 'attachments-form',
      });
      registerWorkspace({
        name: 'conditions',
        title: 'Conditions',
        load: jest.fn(),
        type: 'conditions-form',
      });
      registerWorkspace({
        name: 'vitals',
        title: 'Vitals form',
        load: jest.fn(),
        type: 'form',
      });
      launchPatientWorkspace('allergies');
      launchPatientWorkspace('attachments');
      launchPatientWorkspace('conditions');
      expect(store.getState().openWorkspaces.length).toEqual(3);
      expect(store.getState().openWorkspaces.map((w) => w.name)).toEqual(['conditions', 'attachments', 'allergies']);
      launchPatientWorkspace('vitals');
      expect(store.getState().openWorkspaces.length).toEqual(3);
      expect(store.getState().openWorkspaces[0].name).toBe('conditions');
      const prompt = store.getState().prompt;
      expect(prompt).toBeTruthy();
      expect(prompt.body).toMatch(
        'There are unsaved changes in Conditions. Please save them before opening another form.',
      );
      // Closing the conditions workspace because it cannot be hidden
      prompt.onConfirm();
      expect(store.getState().openWorkspaces.length).toEqual(2);
      // Bringing the `allergies` workspace in front because it matches the vitals workspace type
      expect(store.getState().openWorkspaces[0].name).toEqual('allergies');
      const prompt2 = store.getState().prompt;
      expect(prompt2).toBeTruthy();
      expect(prompt2.body).toMatch(
        'There are unsaved changes in Allergies. Please save them before opening another form.',
      );
      prompt2.onConfirm();
      expect(store.getState().openWorkspaces.length).toEqual(2);
      expect(store.getState().openWorkspaces[0].name).toBe('vitals');
      expect(store.getState().openWorkspaces[1].name).toBe('attachments');
    });

    it("should launch workspace in workspace's preferredSize", () => {
      const store = getWorkspaceStore();
      registerWorkspace({
        name: 'allergies',
        title: 'Allergies',
        load: jest.fn(),
        canHide: true,
        type: 'form',
        preferredWindowSize: 'maximized',
      });
      registerWorkspace({
        name: 'attachments',
        title: 'Attachements',
        load: jest.fn(),
        canHide: true,
        type: 'attachments-form',
      });
      registerWorkspace({
        name: 'conditions',
        title: 'Conditions',
        load: jest.fn(),
        type: 'conditions-form',
        preferredWindowSize: 'maximized',
      });
      launchPatientWorkspace('allergies');
      expect(store.getState().openWorkspaces.length).toBe(1);
      expect(store.getState().workspaceWindowState).toBe('maximized');
      launchPatientWorkspace('attachments');
      expect(store.getState().openWorkspaces.length).toBe(2);
      expect(store.getState().workspaceWindowState).toBe('normal');
      launchPatientWorkspace('conditions');
      expect(store.getState().openWorkspaces.length).toBe(3);
      expect(store.getState().workspaceWindowState).toBe('maximized');
      store.getState().openWorkspaces[0].closeWorkspace(false);
      expect(store.getState().workspaceWindowState).toBe('normal');
      store.getState().openWorkspaces[0].closeWorkspace(false);
      expect(store.getState().workspaceWindowState).toBe('maximized');
      store.getState().openWorkspaces[0].closeWorkspace(false);
      expect(store.getState().workspaceWindowState).toBe('normal');
    });
  });

  test('coexisting and non-coexisting workspaces', () => {
    const store = getWorkspaceStore();
    // conditions and form-entry are of the same (default) type, so they will not coexist.
    // order-meds is of a different type, so it will open on top of the others.
    registerWorkspace({ name: 'conditions', title: 'Conditions', load: jest.fn(), canHide: true });
    registerWorkspace({ name: 'form-entry', title: 'Some Form', load: jest.fn(), canHide: true });
    registerWorkspace({
      name: 'order-meds',
      title: 'Order Medications',
      load: jest.fn(),
      canHide: true,
      type: 'order',
    });
    // Test opening the same workspace twice--should be a no-op
    launchPatientWorkspace('conditions');
    launchPatientWorkspace('conditions');
    expect(store.getState().openWorkspaces.length).toEqual(1);
    // Test opening a workspace of the same type--should require confirmation and then replace
    launchPatientWorkspace('form-entry', { foo: true });
    expect(store.getState().openWorkspaces.length).toEqual(1);
    expect(store.getState().openWorkspaces[0].name).toBe('conditions');
    expect(store.getState().prompt.title).toMatch('You have unsaved changes');
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
    expect(store.getState().openWorkspaces[0].name).toBe('form-entry');
    expect(store.getState().openWorkspaces[1].name).toBe('order-meds');
    expect(store.getState().prompt.title).toMatch('You have unsaved changes');
    cancelPrompt(); // should leave same workspaces intact
    expect(store.getState().openWorkspaces.length).toEqual(2);
    expect(store.getState().openWorkspaces[0].name).toBe('form-entry');
    expect(store.getState().openWorkspaces[1].name).toBe('order-meds');
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
    expect(store.getState().prompt.title).toBe('You have unsaved changes');
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
    expect(store.getState().prompt).toBeNull();
    expect(store.getState().openWorkspaces.length).toBe(0);
  });
});
