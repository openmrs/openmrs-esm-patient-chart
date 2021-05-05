import React, { useReducer } from 'react';
import styles from './visit-dashboard.css';
import NewVisit from './new-visit.component';
import EditVisit from './edit-visit.component';
import { Trans } from 'react-i18next';

export interface VisitDashboardProps {
  patientUuid: string;
  closeComponent(): void;
}

interface VisitDashboardPropsDefaultState {
  displayVisitDashboard: boolean;
  displayNewVisit: boolean;
  displayEditVisit: boolean;
  editMode: boolean;
}

enum DisplayModes {
  NEW_VISIT = 'newVisit',
  EDIT_VISIT = 'editVisit',
  DASHBOARD = 'dashboard',
  EDITTING_VISIT = 'edittingVisit',
}

interface NewVisitAction {
  displayMode: DisplayModes;
  visitData?: any;
  anythingElse?: any;
}

interface EditVisitAction {
  displayMode: DisplayModes;
  visitData?: any;
  anythingElse?: any;
}

type ActionTypes = EditVisitAction | NewVisitAction;

function reducer(state: VisitDashboardPropsDefaultState, action: ActionTypes): VisitDashboardPropsDefaultState {
  switch (action.displayMode) {
    case DisplayModes.NEW_VISIT:
      return {
        displayVisitDashboard: false,
        displayNewVisit: true,
        displayEditVisit: false,
        editMode: true,
      };
    case DisplayModes.EDIT_VISIT:
      return {
        displayVisitDashboard: false,
        displayNewVisit: false,
        displayEditVisit: true,
        editMode: false,
      };
    case DisplayModes.EDITTING_VISIT:
      return {
        displayVisitDashboard: false,
        displayNewVisit: true,
        displayEditVisit: false,
        editMode: false,
      };
    default:
      return {
        displayVisitDashboard: true,
        displayNewVisit: false,
        displayEditVisit: false,
        editMode: true,
      };
  }
}

const visitDashboardInitialState: VisitDashboardPropsDefaultState = {
  editMode: true,
  displayVisitDashboard: true,
  displayNewVisit: false,
  displayEditVisit: false,
};

const VisitDashboard: React.FC<VisitDashboardProps> = ({ closeComponent = () => {}, patientUuid }) => {
  const [state, dispatch] = useReducer(reducer, visitDashboardInitialState);

  return (
    <div className={`omrs-card ${styles.card}`}>
      {state.displayVisitDashboard && (
        <div className={styles.visitContainer}>
          <button
            type="button"
            className={`omrs-btn omrs-outlined-action`}
            onClick={() => dispatch({ displayMode: DisplayModes.NEW_VISIT })}>
            <Trans i18nKey="newVisit">New visit</Trans>
            <svg className="omrs-icon">
              <use xlinkHref="#omrs-icon-chevron-right"></use>
            </svg>
          </button>

          <button
            type="button"
            className={`omrs-btn omrs-outlined-action`}
            onClick={() => dispatch({ displayMode: DisplayModes.EDIT_VISIT })}>
            <Trans i18nKey="editVisit">Edit visit</Trans>
            <svg className="omrs-icon">
              <use xlinkHref="#omrs-icon-zoomoutmap"></use>
            </svg>
          </button>
        </div>
      )}
      {state.displayNewVisit && (
        <NewVisit
          patientUuid={patientUuid}
          onVisitStarted={() => {}}
          onCanceled={() => {
            dispatch({ displayMode: DisplayModes.DASHBOARD });
          }}
          viewMode={state.editMode}
          closeComponent={closeComponent}
        />
      )}
      {state.displayEditVisit && (
        <EditVisit
          patientUuid={patientUuid}
          onVisitStarted={() => {
            dispatch({ displayMode: DisplayModes.EDITTING_VISIT });
          }}
          onCanceled={() => {
            dispatch({ displayMode: DisplayModes.DASHBOARD });
          }}
          closeComponent={closeComponent}
        />
      )}
    </div>
  );
};

export default VisitDashboard;
