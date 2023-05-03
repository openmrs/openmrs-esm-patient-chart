import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Checkbox,
  DatePicker,
  DatePickerInput,
  Form,
  InlineLoading,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Row,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  TextArea,
  TextInput,
} from '@carbon/react';
import {
  ExtensionSlot,
  FetchResponse,
  showNotification,
  showToast,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { saveAllergy, NewAllergy, useAllergensAndAllergicReactions } from './allergy-form.resource';
import styles from './allergy-form.scss';
import { useAllergies } from '../allergy-intolerance.resource';

type AllergenType = 'FOOD' | 'DRUG' | 'ENVIRONMENT';

function AllergyForm({ closeWorkspace, promptBeforeClosing, patientUuid }: DefaultWorkspaceProps) {
  const { t } = useTranslation();
  const { concepts } = useConfig();
  const isTablet = useLayoutType() === 'tablet';
  const allergenTypes = [t('drug', 'Drug'), t('food', 'Food'), t('environmental', 'Environmental')];
  const severityLevels = [t('mild', 'Mild'), t('moderate', 'Moderate'), t('severe', 'Severe')];
  const patientState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { mildReactionUuid, severeReactionUuid, moderateReactionUuid, otherConceptUuid } = useMemo(
    () => concepts,
    [concepts],
  );
  const { allergensAndAllergicReactions, isLoading } = useAllergensAndAllergicReactions();
  const [allergicReactions, setAllergicReactions] = useState<Array<string>>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [nonCodedAllergenType, setNonCodedAllergenType] = useState('');
  const [nonCodedAllergicReaction, setNonCodedAllergicReaction] = useState('');
  const [onsetDate, setOnsetDate] = useState<Date | null>(null);
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [selectedAllergenType, setSelectedAllergenType] = useState<AllergenType>('DRUG');
  const [severityOfWorstReaction, setSeverityOfWorstReaction] = useState('');
  const { mutate } = useAllergies(patientUuid);

  useEffect(() => {
    promptBeforeClosing(() => {
      return Boolean(
        nonCodedAllergenType || nonCodedAllergicReaction || onsetDate || selectedAllergen || severityOfWorstReaction,
      );
    });
  }, [
    promptBeforeClosing,
    nonCodedAllergenType,
    nonCodedAllergicReaction,
    onsetDate,
    selectedAllergen,
    selectedAllergenType,
    severityOfWorstReaction,
  ]);

  const handleTabChange = (index: number) => {
    switch (index) {
      case 0:
        setSelectedAllergenType('DRUG');
        break;
      case 1:
        setSelectedAllergenType('FOOD');
        break;
      case 2:
        setSelectedAllergenType('ENVIRONMENT');
        break;
    }
  };

  const handleAllergicReactionChange = useCallback((event, { checked, id }) => {
    checked
      ? setAllergicReactions((prevState) => [...prevState, id])
      : setAllergicReactions((prevState) => prevState.filter((reaction) => reaction !== id));
  }, []);

  const handleSubmit = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault();

      let payload: NewAllergy = {
        allergen:
          selectedAllergen === otherConceptUuid
            ? {
                allergenType: selectedAllergenType,
                codedAllergen: {
                  uuid: selectedAllergen,
                },
                nonCodedAllergen: nonCodedAllergenType,
              }
            : {
                allergenType: selectedAllergenType,
                codedAllergen: {
                  uuid: selectedAllergen,
                },
              },
        severity: {
          uuid: severityOfWorstReaction,
        },
        comment,
        reactions: allergicReactions?.map((reaction) => {
          return reaction === otherConceptUuid
            ? { reaction: { uuid: reaction }, reactionNonCoded: nonCodedAllergicReaction }
            : { reaction: { uuid: reaction } };
        }),
      };

      const abortController = new AbortController();
      saveAllergy(payload, patientUuid, abortController)
        .then(
          (response: FetchResponse) => {
            if (response.status === 201) {
              mutate();
              closeWorkspace();

              showToast({
                critical: true,
                kind: 'success',
                title: t('allergySaved', 'Allergy saved'),
                description: t('allergyNowVisible', 'It is now visible on the Allergies page'),
              });
            }
          },
          (err) => {
            showNotification({
              title: t('allergySaveError', 'Error saving allergy'),
              kind: 'error',
              critical: true,
              description: err?.message,
            });
          },
        )
        .finally(() => abortController.abort());
    },
    [
      selectedAllergen,
      otherConceptUuid,
      selectedAllergenType,
      nonCodedAllergenType,
      severityOfWorstReaction,
      comment,
      allergicReactions,
      patientUuid,
      nonCodedAllergicReaction,
      closeWorkspace,
      t,
      mutate,
    ],
  );

  return (
    <Form>
      {isTablet ? (
        <Row className={styles.header}>
          <ExtensionSlot
            className={styles.content}
            extensionSlotName="patient-details-header-slot"
            state={patientState}
          />
        </Row>
      ) : null}
      <div className={`${styles.form} ${isTablet ? styles.tablet : styles.desktop}`}>
        {/* This <div> is necessary for the styling in the `.form` class to work */}
        <div>
          <h1 className={styles.heading}>{t('allergensAndReactions', 'Allergens and reactions')}</h1>
          {error ? (
            <InlineNotification
              style={{ margin: '0rem', minWidth: '100%' }}
              kind="error"
              lowContrast={true}
              title={t('errorFetchingData', 'Error fetching allergens and reactions')}
              subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
            />
          ) : null}
          <div className={`${styles.container} ${isTablet ? styles.tabletContainer : styles.desktopContainer}`}>
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t('selectAllergens', 'Select the allergens')}</h2>
              <Tabs onSelectionChange={handleTabChange}>
                <TabList aria-label="Allergen tabs" className={styles.tablist}>
                  {allergenTypes.map((allergenType, index) => {
                    return (
                      <Tab className={styles.tab} id={`tab-${index + 1}`} key={`allergen-tab-${index}`}>
                        {allergenType}
                      </Tab>
                    );
                  })}
                </TabList>
                <TabPanels>
                  {isLoading ? (
                    <InlineLoading style={{ margin: '1rem' }} description={`${t('loading', 'Loading')} ...`} />
                  ) : (
                    allergenTypes.map((allergenType, index) => {
                      const allergenCategory = allergenType.toLowerCase() + 'Allergens';
                      return (
                        <TabPanel key={`allergen-tab-panel-${index}`}>
                          <div className={isTablet ? styles.wrapperContainer : undefined}>
                            <RadioButtonGroup
                              name={`allergen-type-${index + 1}`}
                              key={allergenCategory}
                              orientation="vertical"
                              onChange={(event) => setSelectedAllergen(event.toString())}
                              valueSelected={selectedAllergen}
                            >
                              {allergensAndAllergicReactions?.[allergenCategory]?.map((allergen, index) => (
                                <RadioButton
                                  key={`allergen-${index}`}
                                  className={styles.radio}
                                  id={allergen.display}
                                  labelText={allergen.display}
                                  value={allergen.uuid}
                                />
                              ))}
                            </RadioButtonGroup>
                          </div>
                        </TabPanel>
                      );
                    })
                  )}
                </TabPanels>
              </Tabs>
              {selectedAllergen === otherConceptUuid ? (
                <div className={styles.input}>
                  <TextInput
                    light={isTablet}
                    id="nonCodedAllergenType"
                    labelText={t('otherNonCodedAllergen', 'Other non-coded allergen')}
                    onChange={(event) => setNonCodedAllergenType(event.target.value)}
                    placeholder={t('typeAllergenName', 'Please type in the name of the allergen')}
                  />
                </div>
              ) : null}
            </section>
            <section className={styles.section}>
              <h2 className={styles.midSectionHeading}>{t('selectReactions', 'Select the reactions')}</h2>
              <div className={isTablet ? styles.checkboxContainer : undefined} style={{ margin: '1rem' }}>
                {isLoading ? (
                  <InlineLoading description={`${t('loading', 'Loading')} ...`} />
                ) : (
                  allergensAndAllergicReactions?.allergicReactions?.map((reaction, index) => (
                    <Checkbox
                      className={styles.checkbox}
                      key={index}
                      labelText={reaction.display}
                      id={reaction.uuid}
                      onChange={handleAllergicReactionChange}
                      value={reaction.display}
                    />
                  ))
                )}
              </div>
              {allergicReactions.includes(otherConceptUuid) ? (
                <div className={styles.input}>
                  <TextInput
                    light={isTablet}
                    id="nonCodedAllergicReaction"
                    labelText={t('otherNonCodedAllergicReaction', 'Other non-coded allergic reaction')}
                    onChange={(event) => setNonCodedAllergicReaction(event.target.value)}
                    placeholder={t('typeAllergicReactionName', 'Please type in the name of the allergic reaction')}
                  />
                </div>
              ) : null}
            </section>
          </div>
          <h1 className={styles.heading}>{t('severityAndOnsetDate', 'Severity and date of onset')}</h1>
          <div className={`${styles.container} ${isTablet ? styles.tabletContainer : styles.desktopContainer}`}>
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t('severityOfWorstReaction', 'Severity of worst reaction')}</h2>
              <div className={styles.wrapper}>
                <RadioButtonGroup
                  name="severity-of-worst-reaction"
                  onChange={(event) => setSeverityOfWorstReaction(event.toString())}
                  valueSelected={severityOfWorstReaction}
                >
                  {severityLevels.map((severity, index) => (
                    <RadioButton
                      id={severity.toLowerCase() + 'Severity'}
                      key={`severity-${index}`}
                      labelText={severity}
                      value={(() => {
                        switch (severity.toLowerCase()) {
                          case 'mild':
                            return mildReactionUuid;
                          case 'moderate':
                            return moderateReactionUuid;
                          case 'severe':
                            return severeReactionUuid;
                          default:
                            return '';
                        }
                      })()}
                    />
                  ))}
                </RadioButtonGroup>
              </div>
            </section>
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t('onsetDateAndComments', 'Onset date and comments')}</h2>
              <div className={styles.wrapper}>
                <TextArea
                  className={styles.textbox}
                  cols={20}
                  light={!isTablet}
                  id="comments"
                  invalidText={t('invalidComment', 'Invalid comment, try again')}
                  labelText={t('dateOfOnsetAndComments', 'Date of onset and comments')}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={t('typeAdditionalComments', 'Type any additional comments here')}
                  rows={4}
                />
              </div>
            </section>
          </div>
        </div>
        <ButtonSet className={isTablet ? styles.tabletButtons : styles.desktopButtons}>
          <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={!selectedAllergen || (selectedAllergen === otherConceptUuid && !nonCodedAllergenType)}
            onClick={handleSubmit}
            kind="primary"
          >
            {t('saveAndClose', 'Save and close')}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
}

export default AllergyForm;
