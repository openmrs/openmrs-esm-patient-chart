import React from 'react';
import styles from './allergy-form.component.scss';
import { useTranslation } from 'react-i18next';
import Button from 'carbon-components-react/es/components/Button';
import RadioButtonGroup from 'carbon-components-react/es/components/RadioButtonGroup';
import RadioButton from 'carbon-components-react/es/components/RadioButton';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import TextArea from 'carbon-components-react/es/components/TextArea';
import Checkbox from 'carbon-components-react/es/components/Checkbox';
import Tabs from 'carbon-components-react/es/components/Tabs';
import Tab from 'carbon-components-react/es/components/Tab';
import { createErrorHandler, showNotification, showToast, useConfig } from '@openmrs/esm-framework';
import { AllergiesConfigObject } from '../../config-schema';
import { fetchAllergensAndReaction, savePatientAllergy } from './allergy-form.resource';
import AllergyFormTab from './allergy-form-tab.component';
import SearchSkeleton from 'carbon-components-react/lib/components/Search/Search.Skeleton';

enum StateTypes {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  ERROR = 'error',
}

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
  drugAllergens: Array<{ uuid: string; display: string }>;
  foodAllergens: Array<{ uuid: string; display: string }>;
  environmentalAllergens: Array<{ uuid: string; display: string }>;
  allergyReaction: Array<{ uuid: string; display: string }>;
}

const AllergyFormCarbon: React.FC<AllergyFormProps> = ({ isTablet, closeWorkspace, patientUuid }) => {
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
  } = React.useMemo(() => concepts, [concepts]);
  const [allergenAndReaction, setAllergenAndReactions] = React.useState<AllergyAndReactions>();
  const [comment, setComment] = React.useState<string>();
  const [patientReactions, setPatientReactions] = React.useState<Array<string>>([]);
  const [selectedAllergen, setSelectedAllergen] = React.useState<string>();
  const [severityOfReaction, setSeverityOfReaction] = React.useState<string>();
  const [dateOfOnset, setDateOfOnset] = React.useState<string | Date>();
  const [status, setStatus] = React.useState<StateTypes>(StateTypes.PENDING);
  const [allergenType, setAllergenType] = React.useState<AllergenType>(AllergenType.DRUG);

  React.useEffect(() => {
    if (drugAllergenUuid && foodAllergenUuid && environmentalAllergenUuid) {
      const sub = fetchAllergensAndReaction([
        drugAllergenUuid,
        foodAllergenUuid,
        environmentalAllergenUuid,
        allergyReactionUuid,
      ]).subscribe(
        (data) => {
          setAllergenAndReactions(data);
          setStatus(StateTypes.RESOLVED);
        },
        (error) => console.error(error),
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
    if (index === 0) setAllergenType(AllergenType.DRUG);
    if (index === 1) setAllergenType(AllergenType.FOOD);
    if (index === 2) setAllergenType(AllergenType.ENVIRONMENT);
  }, []);

  const handleSavePatientAllergy = React.useCallback(() => {
    const restApiPayLoad = {
      allergen: {
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
        return { reaction: { uuid: reaction } };
      }),
    };

    const ac = new AbortController();
    savePatientAllergy(restApiPayLoad, patientUuid, ac).then((response) => {
      if (response.status === 201) {
        closeWorkspace();

        showToast({
          kind: 'success',
          description: t('allergySaved', 'Allergy saved successfully'),
        });
      }
      (err) => {
        createErrorHandler();

        showNotification({
          title: t('allergySaveError', 'Error saving allergy'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      };
    });
  }, [allergenType, closeWorkspace, comment, patientReactions, patientUuid, selectedAllergen, severityOfReaction, t]);

  return (
    <main className={styles.allergyFormWrapper}>
      {status === StateTypes.PENDING && <SearchSkeleton />}
      {status === StateTypes.RESOLVED && (
        <>
          <div>
            <header className={styles.productiveHeading03}>{t('allergenAndReaction', 'Allergen and Reactions')}</header>
            <div className={styles.sectionWrapper}>
              <section>
                <header className={styles.productiveHeading02}>Select the allergens</header>
                <Tabs
                  onSelectionChange={handleAllergenTypeChange}
                  tabContentClassName={styles.allergyFormTabs}
                  scrollIntoView={true}>
                  <Tab href="#" id="tab-1" label={t('drug', 'Drug')}>
                    <AllergyFormTab
                      name={'drug'}
                      allergens={allergenAndReaction?.drugAllergens}
                      selectedAllergen={selectedAllergen}
                      handleChange={setSelectedAllergen}
                    />
                  </Tab>
                  <Tab href="#" id="tab-2" label={t('food', 'Food')}>
                    <AllergyFormTab
                      name="food"
                      allergens={allergenAndReaction?.foodAllergens}
                      selectedAllergen={selectedAllergen}
                      handleChange={setSelectedAllergen}
                    />
                  </Tab>
                  <Tab href="#" id="tab-3" label={t('environmental', 'Environmental')}>
                    <AllergyFormTab
                      name="environment"
                      allergens={allergenAndReaction?.environmentalAllergens}
                      selectedAllergen={selectedAllergen}
                      handleChange={setSelectedAllergen}
                    />
                  </Tab>
                </Tabs>
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
                  onChange={(event) => setSeverityOfReaction(event)}
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
                    onChange={(event) => setDateOfOnset(event)}
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
              <Button onClick={handleSavePatientAllergy}>{t('saveAndClose', 'Save and Close')}</Button>
            </section>
          </div>
        </>
      )}
    </main>
  );
};

export default AllergyFormCarbon;
