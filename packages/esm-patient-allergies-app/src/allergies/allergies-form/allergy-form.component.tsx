import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Checkbox,
  Form,
  InlineLoading,
  InlineNotification,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Row,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextArea,
  TextInput,
} from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, type Control, type UseFormSetValue } from 'react-hook-form';
import { ExtensionSlot, type FetchResponse, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

// ... (your existing imports)

// Remove unnecessary imports
import { saveAllergy, useAllergies } from '../allergy-intolerance.resource';
import styles from './allergy-form.scss';
import { type NewAllergy, useAllergensAndAllergicReactions } from './allergy-form.resource';

type AllergenType = 'FOOD' | 'DRUG' | 'ENVIRONMENT';

const allergyFormSchema = z.object({
  selectedAllergen: z.string(),
  nonCodedAllergenType: z.string().optional(),
  allergicReactions: z.array(z.string().optional()),
  nonCodedAllergicReaction: z.string().optional(),
  severityOfWorstReaction: z.string(),
  comment: z.string().optional(),
});

type AllergyFormData = z.infer<typeof allergyFormSchema>;

function AllergyForm({ closeWorkspace, patientUuid }: DefaultWorkspaceProps) {
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
  const [error, setError] = useState<Error | null>(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [selectedAllergenType, setSelectedAllergenType] = useState<AllergenType>('DRUG');
  const { mutate } = useAllergies(patientUuid);

  const { control, handleSubmit, watch, getValues, setValue } = useForm<AllergyFormData>({
    mode: 'all',
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergicReactions: [],
    },
  });

  const allergicReactionsWatcher = watch('allergicReactions');
  const selectedAllergen = watch('selectedAllergen');
  const allergicReactions = watch('allergicReactions');
  const severityOfWorstReaction = watch('severityOfWorstReaction');
  const nonCodedAllergenType = watch('nonCodedAllergenType');
  const nonCodedAllergicReaction = watch('nonCodedAllergicReaction');

  useEffect(() => {
    const reactionsValidation = allergicReactions?.some((item) => item !== '');
    if (!!selectedAllergen && reactionsValidation && !!severityOfWorstReaction) setIsDisabled(false);
    else setIsDisabled(true);
  }, [allergicReactions, selectedAllergen, severityOfWorstReaction, otherConceptUuid, nonCodedAllergenType]);

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

  const onSubmit = useCallback(
    (data: AllergyFormData) => {
      const {
        comment,
        selectedAllergen,
        nonCodedAllergenType,
        nonCodedAllergicReaction,
        allergicReactions,
        severityOfWorstReaction,
      } = data;

      const selectedAllergicReactions = allergicReactions.filter((value) => value !== '');

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
        reactions: selectedAllergicReactions?.map((reaction) => {
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

              showSnackbar({
                isLowContrast: true,
                kind: 'success',
                title: t('allergySaved', 'Allergy saved'),
                subtitle: t('allergyNowVisible', 'It is now visible on the Allergies page'),
              });
            }
          },
          (err) => {
            setError(err);
            showSnackbar({
              title: t('allergySaveError', 'Error saving allergy'),
              kind: 'error',
              isLowContrast: false,
              subtitle: err?.message,
            });
          },
        )
        .finally(() => abortController.abort());
    },
    [selectedAllergenType, otherConceptUuid, patientUuid, closeWorkspace, t, mutate],
  );

  return (
    <Form>
      {isTablet ? (
        <Row className={styles.header}>
          <ExtensionSlot className={styles.content} name="patient-details-header-slot" state={patientState} />
        </Row>
      ) : null}
      <div className={classNames(styles.form, isTablet ? styles.tablet : styles.desktop)}>
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
          <div className={classNames(styles.container, isTablet ? styles.tabletContainer : styles.desktopContainer)}>
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
                            <Controller
                              name="selectedAllergen"
                              control={control}
                              render={({ field: { onBlur, onChange, value } }) => (
                                <RadioButtonGroup
                                  name={`allergen-type-${index + 1}`}
                                  key={allergenCategory}
                                  orientation="vertical"
                                  onChange={(event) => onChange(event.toString())}
                                  valueSelected={value}
                                  onBlur={onBlur}
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
                              )}
                            />
                          </div>
                        </TabPanel>
                      );
                    })
                  )}
                </TabPanels>
              </Tabs>
              {selectedAllergen === otherConceptUuid ? (
                <div className={styles.input}>
                  <ResponsiveWrapper isTablet={isTablet}>
                    <Controller
                      name="nonCodedAllergenType"
                      control={control}
                      rules={{ required: watch('selectedAllergen') === otherConceptUuid }}
                      render={({ field: { onBlur, onChange, value, ref } }) => (
                        <TextInput
                          id="nonCodedAllergenType"
                          labelText={t('otherNonCodedAllergen', 'Other non-coded allergen')}
                          onChange={onChange}
                          onBlur={onBlur}
                          placeholder={t('typeAllergenName', 'Please type in the name of the allergen')}
                          value={value}
                          ref={ref}
                        />
                      )}
                    />
                  </ResponsiveWrapper>
                </div>
              ) : null}
            </section>
            <section className={styles.section}>
              <h2 className={styles.midSectionHeading}>{t('selectReactions', 'Select the reactions')}</h2>
              <div className={isTablet ? styles.checkboxContainer : undefined} style={{ margin: '1rem' }}>
                {isLoading ? (
                  <InlineLoading description={`${t('loading', 'Loading')} ...`} />
                ) : (
                  <AllergicReactionsField
                    allergensAndAllergicReactions={allergensAndAllergicReactions}
                    methods={{ setValue, control }}
                  />
                )}
              </div>
              {allergicReactionsWatcher?.includes(otherConceptUuid) ? (
                <div className={styles.input}>
                  <ResponsiveWrapper isTablet={isTablet}>
                    <Controller
                      name="nonCodedAllergicReaction"
                      control={control}
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          id="nonCodedAllergicReaction"
                          labelText={t('otherNonCodedAllergicReaction', 'Other non-coded allergic reaction')}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          placeholder={t(
                            'typeAllergicReactionName',
                            'Please type in the name of the allergic reaction',
                          )}
                        />
                      )}
                    />
                  </ResponsiveWrapper>
                </div>
              ) : null}
            </section>
          </div>
          <h1 className={styles.heading}>{t('severityAndOnsetDate', 'Severity and date of onset')}</h1>
          <div className={classNames(styles.container, isTablet ? styles.tabletContainer : styles.desktopContainer)}>
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t('severityOfWorstReaction', 'Severity of worst reaction')}</h2>
              <div className={styles.wrapper}>
                <Controller
                  name="severityOfWorstReaction"
                  control={control}
                  render={({ field: { onBlur, onChange, value } }) => (
                    <RadioButtonGroup
                      name="severity-of-worst-reaction"
                      onChange={(event) => onChange(event.toString())}
                      valueSelected={value}
                      onBlur={onBlur}
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
                  )}
                />
              </div>
            </section>
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{t('onsetDateAndComments', 'Onset date and comments')}</h2>
              <div className={styles.wrapper}>
                <ResponsiveWrapper isTablet={isTablet}>
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextArea
                        cols={20}
                        id="comments"
                        invalidText={t('invalidComment', 'Invalid comment, try again')}
                        labelText={t('dateOfOnsetAndComments', 'Date of onset and comments')}
                        onChange={onChange}
                        placeholder={t('typeAdditionalComments', 'Type any additional comments here')}
                        onBlur={onBlur}
                        value={value}
                        rows={4}
                      />
                    )}
                  />
                </ResponsiveWrapper>
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
            disabled={
              isDisabled ||
              (selectedAllergen === otherConceptUuid && !nonCodedAllergenType) ||
              (allergicReactions?.includes(otherConceptUuid) && !nonCodedAllergicReaction)
            }
            onClick={handleSubmit(onSubmit)}
            kind="primary"
          >
            {t('saveAndClose', 'Save and close')}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
}

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

type AllergensAndAllergicReactions = {
  allergicReactions: Array<{
    uuid: string;
    display: string;
  }>;
};

type AllergicReactionsFieldProps = {
  allergensAndAllergicReactions: AllergensAndAllergicReactions;
  methods: { setValue: UseFormSetValue<any>; control: Control<any> };
};

function AllergicReactionsField({ allergensAndAllergicReactions, methods }: AllergicReactionsFieldProps) {
  const { setValue, control } = methods;

  // Define handleAllergicReactionChange outside of this component
  const handleAllergicReactionChange = useCallback(
    (onChange, checked, id, index) => {
      onChange(id);
      setValue(`allergicReactions.${index}`, checked ? id : '');
    },
    [setValue],
  );

  const controlledFields = allergensAndAllergicReactions.allergicReactions.map((reaction, index) => (
    <Controller
      key={reaction.uuid}
      name={`allergicReactions.${index}`}
      control={control}
      defaultValue=""
      render={({ field: { onBlur, onChange, value } }) => (
        <Checkbox
          className={styles.checkbox}
          labelText={reaction.display}
          id={reaction.uuid}
          onChange={(event, { checked, id }) => {
            handleAllergicReactionChange(onChange, checked, id, index);
          }}
          checked={Boolean(value)}
          onBlur={onBlur}
        />
      )}
    />
  ));

  return <React.Fragment>{controlledFields}</React.Fragment>;
}

export default AllergicReactionsField;
