import { createGlobalStore, useStore } from '@openmrs/esm-framework';

interface PanelControls {
  /** Set by the bell while the panel is open; null when it is closed or the bell is unmounted. */
  close: (() => void) | null;
}

/**
 * Bridges the bell and the inbox rows, which the app shell mounts into two different slots.
 *
 * Only `notifications-menu-button-slot` is handed `togglePanel`, so the rows in
 * `notifications-nav-menu-slot` have no way to dismiss the panel they sit in. The bell publishes a
 * close callback here while the panel is open and the rows call it.
 *
 * This exists solely to keep our own close button working. Once the shell's notifications panel
 * grows a close affordance of its own, both this store and the button should go.
 */
const panelControlsStore = createGlobalStore<PanelControls>('smart-notifications-panel-controls', { close: null });

export function setNotificationsPanelClose(close: (() => void) | null) {
  if (panelControlsStore.getState().close !== close) {
    panelControlsStore.setState({ close });
  }
}

export function useCloseNotificationsPanel(): (() => void) | null {
  return useStore(panelControlsStore).close;
}

/** Test seam: drops the published callback. */
export function _resetPanelControls() {
  panelControlsStore.setState({ close: null });
}
