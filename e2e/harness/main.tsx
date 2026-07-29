import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { getGlobalStore } from '@openmrs/esm-framework';
import NotificationBell from '../../packages/esm-patient-tests-app/src/smart-notifications/notification-bell.extension';
import NotificationDetailModal from '../../packages/esm-patient-tests-app/src/smart-notifications/notification-detail.modal';
import ReviewedBanner from '../../packages/esm-patient-tests-app/src/smart-notifications/reviewed-banner.component';
import { type SmartNotification } from '../../packages/esm-patient-tests-app/src/smart-notifications/notification-model';
import { setOptIn } from '../../packages/esm-patient-tests-app/src/smart-notifications/opt-in-store';
import {
  markNotificationReviewed,
  setReviewUser,
} from '../../packages/esm-patient-tests-app/src/smart-notifications/review-store';
import { LabOrderForm } from '../../packages/esm-patient-tests-app/src/test-orders/add-test-order/test-order-form.component';
import Chrome from './chrome';
import { harnessPatient, harnessPatientUuid, type ScenarioName, scenarios } from './fixtures';
import './styles.scss';

/**
 * Screenshot harness.
 *
 * The bell, its inbox, the detail modal, the reviewed banner and the order form are all the real
 * components. Only the framework seam is faked: `openmrsFetch` serves fixture orders and
 * observations, so the notifications on screen are produced by the shipped classification rule.
 *
 * `?scene=` picks what is on screen and `?scenario=` picks the fixture set, so the Playwright spec
 * can drive each case deterministically.
 */

const params = new URLSearchParams(window.location.search);
const scene = params.get('scene') ?? 'orders';
const scenarioName = (params.get('scenario') as ScenarioName) ?? 'single';

// The bell discovers the open chart through the patient-chart global store, exactly as it does in
// the app, where esm-patient-chart-app populates it on mount and clears it on unmount. `?noPatient`
// leaves it empty, which is what "no chart open" looks like.
if (!params.has('noPatient')) {
  getGlobalStore('patient-chart-global-store', {
    patientUuid: null,
    patient: null,
    visitContext: null,
    mutateVisitContext: null,
  }).setState({ patient: harnessPatient, patientUuid: harnessPatientUuid });
}

setReviewUser('user-uuid-1');
scenarios[scenarioName].optIns.forEach((conceptUuid) => setOptIn(harnessPatientUuid, conceptUuid, true));

function Snackbar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="harnessSnackbar" role="status">
      <span className="harnessSnackbarCheck">✓</span>
      <div>
        <p className="harnessSnackbarTitle">{title}</p>
        <p className="harnessSnackbarSubtitle">{subtitle}</p>
      </div>
    </div>
  );
}

function OrdersEmptyState() {
  return (
    <div className="harnessTile">
      <div className="harnessTileHeader">
        <h3>Orders</h3>
        <span className="harnessLink">Add +</span>
      </div>
      <p className="harnessEmpty">There are no orders to display for this patient</p>
    </div>
  );
}

function ResultsBody() {
  return (
    <div className="harnessTile">
      <div className="harnessTileHeader">
        <h3>Serum chemistry panel</h3>
        <span className="harnessMuted">Today</span>
      </div>
      <table className="harnessTable">
        <thead>
          <tr>
            <th>Test name</th>
            <th>Result date</th>
            <th>Value</th>
            <th>Reference range</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="harnessLink">Serum Creatinine</td>
            <td>Today, 5:27 PM</td>
            <td>
              <strong>1.1 mg/dL</strong>
            </td>
            <td>0.6 – 1.2 mg/dL</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [modal, setModal] = useState<{ notification: SmartNotification } | null>(null);
  const [snackbar, setSnackbar] = useState<{ title: string; subtitle: string } | null>(null);

  useEffect(() => {
    if (scene === 'results-banner') {
      markNotificationReviewed('order-uuid-creatinine:obs-uuid-creatinine', harnessPatientUuid, 'Dr. Sarah Smith');
    }
  }, []);

  // The app shell owns modals and snackbars; the harness renders them inline instead.
  useEffect(() => {
    const onShowModal = (event: Event) => setModal({ notification: (event as CustomEvent).detail.props.notification });
    const onCloseModal = () => setModal(null);
    const onSnackbar = (event: Event) => setSnackbar((event as CustomEvent).detail);

    window.addEventListener('harness:show-modal', onShowModal);
    window.addEventListener('harness:close-modal', onCloseModal);
    window.addEventListener('harness:snackbar', onSnackbar);
    return () => {
      window.removeEventListener('harness:show-modal', onShowModal);
      window.removeEventListener('harness:close-modal', onCloseModal);
      window.removeEventListener('harness:snackbar', onSnackbar);
    };
  }, []);

  const isOrderForm = scene === 'order-form';

  return (
    <>
      <Chrome activeNavItem={scene === 'results-banner' ? 'Results' : 'Orders'} bell={<NotificationBell />}>
        {scene === 'results-banner' ? (
          <>
            <ReviewedBanner patientUuid={harnessPatientUuid} />
            <ResultsBody />
          </>
        ) : (
          <OrdersEmptyState />
        )}
      </Chrome>

      {isOrderForm && (
        <aside className="harnessWorkspace">
          <header className="harnessWorkspaceHeader">
            <h2>Add test order</h2>
          </header>
          <LabOrderForm
            closeWorkspace={() => {}}
            initialOrder={{
              action: 'NEW',
              display: 'Haemoglobin',
              notifyWhenResulted: false,
              testType: { label: 'Haemoglobin', conceptUuid: 'concept-haemoglobin' },
              urgency: params.get('priority') === 'routine' ? 'ROUTINE' : 'STAT',
              visit: null,
            }}
            onCancel={() => {}}
            orderTypeUuid="lab-order-type-uuid"
            orderableConceptSets={[]}
            patient={harnessPatient}
            setHasUnsavedChanges={() => {}}
          />
        </aside>
      )}

      {modal && (
        <div className="harnessModalOverlay">
          {/* role=dialog matches what the app shell renders, and is what the bell's outside-click
              handler looks for when deciding not to dismiss the inbox behind the modal. */}
          <div aria-label="Notification detail" className="harnessModal" role="dialog">
            <NotificationDetailModal
              closeModal={() => setModal(null)}
              notification={modal.notification}
              patient={harnessPatient}
            />
          </div>
        </div>
      )}

      {snackbar && <Snackbar subtitle={snackbar.subtitle} title={snackbar.title} />}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
