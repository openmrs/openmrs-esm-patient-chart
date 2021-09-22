import React from 'react';
import styles from './allergy-form.component.scss';
import AllergyFormTab from './allergy-form-tab.component';
import { useTranslation } from 'react-i18next';
import { showNotification, showToast, useConfig } from '@openmrs/esm-framework';
import { AllergiesConfigObject } from '../../config-schema';
import { fetchAllergensAndReaction, savePatientAllergy } from './allergy-form.resource';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import {
  SearchSkeleton,
  TextInput,
  TextArea,
  Checkbox,
  Tabs,
  Tab,
  DatePicker,
  DatePickerInput,
  RadioButton,
  Button,
  RadioButtonGroup,
} from 'carbon-components-react';
import { OpenMRSResource } from '../../types';

enum ActionTypes {
  pending = 'pending',
  resolved = 'resolved',
  error = 'error',
}
interface Pending {
  type: ActionTypes.pending;
}
interface Error {
  type: ActionTypes.error;
  payload: Error;
}

interface Resolved {
  type: ActionTypes.resolved;
  payload: AllergyAndReactions;
}

type Action = Pending | Error | Resolved;

enum AllergenType {
  FOOD = 'FOOD',
  DRUG = 'DRUG',
  ENVIRONMENT = 'ENVIRONMENT',
}

interface AllergyFormProps {
  patient: fhir.Patient;
  patientUuid: string;
  closeWorkspace(): void;
  isTablet: boolean;
}

interface AllergyAndReactions {
  drugAllergens: Array<OpenMRSResource>;
  foodAllergens: Array<OpenMRSResource>;
  environmentalAllergens: Array<OpenMRSResource>;
  allergyReaction: Array<OpenMRSResource>;
}

interface PatientAllergenAndReactions {
  status: 'pending' | 'resolved' | 'error';
  allergenAndReaction: AllergyAndReactions;
  error?: null | Error;
}

const formStatusReducer = (state: PatientAllergenAndReactions, action: Action): PatientAllergenAndReactions => {
  switch (action.type) {
    case 'pending':
      return { ...state, status: action.type };
    case 'resolved':
      return { allergenAndReaction: action.payload, status: action.type };
    case 'error':
      return { ...state, error: action.payload, status: action.type };
  }
};

const AllergyForm: React.FC<AllergyFormProps> = ({ isTablet, closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const { concepts } = useConfig() as AllergiesConfigObject;
  const {
    drugAllergenUuid,
    foodAllergenUuid,
    environmentalAllergenUuid,
    allergyReactionUuid,
    mildReactionUuid,
    severeReactionUuid,
    moderateReactionUuid,
    otherConceptUuid,
  } = React.useMemo(() => concepts, [concepts]);
  const [comment, setComment] = React.useState<string>();
  const [patientReactions, setPatientReactions] = React.useState<Array<string>>([]);
  const [selectedAllergen, setSelectedAllergen] = React.useState<string>();
  const [severityOfReaction, setSeverityOfReaction] = React.useState<string>();
  const [dateOfOnset, setDateOfOnset] = React.useState<Date>();
  const [{ status, allergenAndReaction, error }, dispatch] = React.useReducer(formStatusReducer, {
    status: ActionTypes.pending,
    allergenAndReaction: null,
  });
  const [allergenType, setAllergenType] = React.useState<AllergenType>(AllergenType.DRUG);
  const [otherReaction, setOtherReaction] = React.useState<string>();
  const [otherAllergen, setOtherAllergen] = React.useState<string>();

  React.useEffect(() => {
    if (drugAllergenUuid && foodAllergenUuid && environmentalAllergenUuid) {
      const sub = fetchAllergensAndReaction([
        drugAllergenUuid,
        foodAllergenUuid,
        environmentalAllergenUuid,
        allergyReactionUuid,
      ]).subscribe(
        (data) => {
          dispatch({ type: ActionTypes.resolved, payload: data });
        },
        (error) => {
          dispatch({ type: ActionTypes.error, payload: error });
        },
      );
      return () => sub.unsubscribe();
    }
  }, [drugAllergenUuid, environmentalAllergenUuid, foodAllergenUuid, allergyReactionUuid]);

  const handlePatientReactionChange = React.useCallback(
    (value: boolean, id: string, event: React.ChangeEvent<HTMLInputElement>) => {
      value
        ? setPatientReactions((prevState) => [...prevState, id])
        : setPatientReactions((prevState) => prevState.filter((reaction) => reaction !== id));
    },
    [],
  );

  const handleAllergenTypeChange = React.useCallback((index: number) => {
    switch (index) {
      case 0:
        setAllergenType(AllergenType.DRUG);
      case 1:
        setAllergenType(AllergenType.FOOD);
      case 2:
        setAllergenType(AllergenType.ENVIRONMENT);
    }
  }, []);

  const handleSavePatientAllergy = React.useCallback(() => {
    const restApiPayLoad = {
      allergen:
        selectedAllergen === otherConceptUuid
          ? {
              allergenType: allergenType,
              codedAllergen: {
                uuid: selectedAllergen,
              },
              nonCodedAllergen: otherAllergen,
            }
          : {
              allergenType: allergenType,
              codedAllergen: {
                uuid: selectedAllergen,
              },
            },
      severity: {
        uuid: severityOfReaction,
      },
      comment: comment,
      reactions: patientReactions?.map((reaction) => {
        return reaction === otherConceptUuid
          ? { reaction: { uuid: reaction }, reactionNonCoded: otherReaction }
          : { reaction: { uuid: reaction } };
      }),
    };

    const ac = new AbortController();
    savePatientAllergy(restApiPayLoad, patientUuid, ac).then(
      (response) => {
        if (response.status === 201) {
          closeWorkspace();

          showToast({
            kind: 'success',
            description: t('allergySaved', 'Allergy saved successfully'),
          });
        }
      },
      (err) => {
        dispatch({ type: ActionTypes.error, payload: err });
        showNotification({
          title: t('allergySaveError', 'Error saving allergy'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
    return () => ac.abort();
  }, [
    selectedAllergen,
    otherConceptUuid,
    allergenType,
    otherAllergen,
    severityOfReaction,
    comment,
    patientReactions,
    patientUuid,
    otherReaction,
    closeWorkspace,
    t,
  ]);

  return (
    <main className={styles.allergyFormWrapper}>
      {status === ActionTypes.pending && <SearchSkeleton />}
      {status === ActionTypes.resolved && (
        <>
          <div>
            <header className={styles.productiveHeading03}>{t('allergenAndReaction', 'Allergen and reactions')}</header>
            <div className={styles.sectionWrapper}>
              <section>
                <header className={styles.productiveHeading02}>
                  {t('selectTheAllergens', 'Select the allergens')}
                </header>
                <Tabs
                  onSelectionChange={handleAllergenTypeChange}
                  tabContentClassName={styles.allergyFormTabs}
                  scrollIntoView={true}>
                  <Tab id="tab-1" label={t('drug', 'Drug')}>
                    <AllergyFormTab
                      name={'drug'}
                      allergens={allergenAndReaction?.drugAllergens}
                      selectedAllergen={selectedAllergen}
                      handleChange={setSelectedAllergen}
                    />
                  </Tab>
                  <Tab id="tab-2" label={t('food', 'Food')}>
                    <AllergyFormTab
                      name="food"
                      allergens={allergenAndReaction?.foodAllergens}
                      selectedAllergen={selectedAllergen}
                      handleChange={setSelectedAllergen}
                    />
                  </Tab>
                  <Tab id="tab-3" label={t('environmental', 'Environmental')}>
                    <AllergyFormTab
                      name="environment"
                      allergens={allergenAndReaction?.environmentalAllergens}
                      selectedAllergen={selectedAllergen}
                      handleChange={setSelectedAllergen}
                    />
                  </Tab>
                </Tabs>
                {selectedAllergen === otherConceptUuid && (
                  <TextInput
                    light={isTablet}
                    id="otherAllergen"
                    invalidText={t('otherAllergenInvalidText', 'Other allergen is required')}
                    labelText={t('pleaseSpecifyOtherReaction', 'Please specify other allergen')}
                    onChange={(event) => setOtherAllergen(event.target.value)}
                    placeholder={t('enterOtherReaction', 'Type in other Allergen')}
                  />
                )}
              </section>
              <section>
                <header className={styles.productiveHeading02}>
                  {t('selectTheReactions', 'Select the reactions')}
                </header>
                <div className={styles.checkBoxWrapper}>
                  {allergenAndReaction?.allergyReaction?.map((reaction, index) => (
                    <Checkbox
                      onChange={handlePatientReactionChange}
                      key={index}
                      labelText={reaction.display}
                      id={reaction.uuid}
                      value={reaction.display}
                    />
                  ))}
                </div>
                {patientReactions.includes(otherConceptUuid) && (
                  <TextInput
                    light={isTablet}
                    id="otherReaction"
                    invalidText={t('otherReactionInvalidText', 'Other reaction is required')}
                    labelText={t('pleaseSpecifyOtherReaction', 'Please specify other reaction')}
                    onChange={(event) => setOtherReaction(event.target.value)}
                    placeholder={t('enterOtherReaction', 'Type in other reaction')}
                  />
                )}
              </section>
            </div>
          </div>
          <div>
            <header className={styles.productiveHeading03}>
              {t('severityAndDateOfOnset', 'Severity and date of onset')}
            </header>
            <div className={styles.sectionWrapper}>
              <section>
                <header className={styles.productiveHeading02}>
                  {t('severityOfWorstReaction', 'Severity of worst reaction')}
                </header>
                <RadioButtonGroup
                  onChange={(event) => setSeverityOfReaction(event.toString())}
                  name="severityOfWorstReaction"
                  valueSelected={severityOfReaction}>
                  <RadioButton id="mild" labelText={t('mild', 'Mild')} value={mildReactionUuid} />
                  <RadioButton id="moderate" labelText={t('moderate', 'Moderate')} value={moderateReactionUuid} />
                  <RadioButton id="severe" labelText={t('severe', 'Severe')} value={severeReactionUuid} />
                </RadioButtonGroup>
              </section>
              <section>
                <header className={styles.productiveHeading02}>{t('dateAndComments', 'Date and comments')}</header>
                <DatePicker
                  light={isTablet}
                  maxDate={new Date().toISOString()}
                  dateFormat="m/d/Y"
                  datePickerType="single">
                  <DatePickerInput
                    id="date-of-first-onset"
                    placeholder="mm/dd/yyyy"
                    labelText={t('dateOfFirstOnset', 'Date of first onset')}
                    type="text"
                    size="xl"
                    style={{ width: '18rem' }}
                    onChange={(event) => setDateOfOnset(event.target.valueAsDate)}
                  />
                </DatePicker>
                <TextArea
                  light={isTablet}
                  cols={25}
                  onChange={(event) => setComment(event.target.value)}
                  id="comments"
                  invalidText={t('invalidComment', 'Invalid comment, try again')}
                  labelText={t('comments', 'Comments')}
                  placeholder={t('typeAnyAdditional', 'Type any additional comments here')}
                  rows={4}
                  style={{ width: '26.375rem' }}
                />
              </section>
            </div>
          </div>
          <div>
            <section className={styles.buttonWrapper}>
              <Button onClick={closeWorkspace} kind="secondary">
                {t('discard', 'Discard')}
              </Button>
              <Button onClick={handleSavePatientAllergy}>{t('saveAndClose', 'Save and close')}</Button>
            </section>
          </div>
        </>
      )}
      {status === ActionTypes.error && <ErrorState headerTitle={'Allergy Form Error'} error={error} />}
    </main>
  );
};

export default AllergyForm;
