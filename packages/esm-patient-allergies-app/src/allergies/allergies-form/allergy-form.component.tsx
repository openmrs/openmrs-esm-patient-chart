import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Checkbox,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  Layer,
  RadioButton,
  RadioButtonGroup,
  Row,
  Search,
  Stack,
  TextArea,
  TextInput,
} from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Control, Controller, FormProvider, useForm, type UseFormSetValue } from 'react-hook-form';
import {
  ExtensionSlot,
  type FetchResponse,
  showSnackbar,
  showToast,
  useConfig,
  useLayoutType,
} from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type Allergen,
  type AllergicReaction,
  type NewAllergy,
  saveAllergy,
  useAllergens,
  useAllergicReactions,
} from './allergy-form.resource';
import { useAllergies } from '../allergy-intolerance.resource';
import styles from './allergy-form.scss';
import AllergenPicker from './allergen-picker.component';

const allergyFormSchema = z.object({
  allergen: z
    .object({
      uuid: z.string(),
      display: z.string(),
      type: z.string(),
    })
    .required(),
  nonCodedAllergenType: z.string().optional(),
  allergicReactions: z.array(z.string().optional()),
  nonCodedAllergicReaction: z.string().optional(),
  severityOfWorstReaction: z.string(),
  comment: z.string().optional(),
});

type AllergyFormData = {
  allergen: Allergen;
  nonCodedAllergenType: string;
  allergicReactions: string[];
  nonCodedAllergicReaction: string;
  severityOfWorstReaction: string;
  comment: string;
};

function AllergyForm({ closeWorkspace, patientUuid }: DefaultWorkspaceProps) {
  const { t } = useTranslation();
  const { concepts } = useConfig();
  const isTablet = useLayoutType() === 'tablet';

  const severityLevels = [t('mild', 'Mild'), t('moderate', 'Moderate'), t('severe', 'Severe')];
  const patientState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { mildReactionUuid, severeReactionUuid, moderateReactionUuid, otherConceptUuid } = useMemo(
    () => concepts,
    [concepts],
  );
  const { allergicReactions, isLoading } = useAllergicReactions();
  const { allergens } = useAllergens();
  const [error, setError] = useState<Error | null>(null);

  const [isDisabled, setIsDisabled] = useState(true);
  const { mutate } = useAllergies(patientUuid);

  const { control, handleSubmit, watch, getValues, setValue } = useForm<AllergyFormData>({
    mode: 'all',
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergicReactions: [],
    },
  });

  const selectedAllergen = watch('allergen');
  const selectedAllergicReactions = watch('allergicReactions');
  const selectedSeverityOfWorstReaction = watch('severityOfWorstReaction');
  const selectedNonCodedAllergenType = watch('nonCodedAllergenType');
  const selectedNonCodedAllergicReaction = watch('nonCodedAllergicReaction');

  useEffect(() => {
    const reactionsValidation = selectedAllergicReactions.some((item) => item !== '');
    if (!!selectedAllergen && reactionsValidation && !!selectedSeverityOfWorstReaction) setIsDisabled(false);
    else setIsDisabled(true);
  }, [
    selectedAllergicReactions,
    watch,
    selectedAllergen,
    selectedSeverityOfWorstReaction,
    otherConceptUuid,
    selectedNonCodedAllergenType,
  ]);

  const onSubmit = useCallback(
    (data: AllergyFormData) => {
      const {
        allergen,
        comment,
        nonCodedAllergenType,
        nonCodedAllergicReaction,
        allergicReactions,
        severityOfWorstReaction,
      } = data;

      const selectedAllergicReactions = allergicReactions.filter((value) => value !== '');
      let payload: NewAllergy = {
        allergen:
          allergen.uuid == otherConceptUuid
            ? {
                allergenType: allergen.type,
                codedAllergen: { uuid: allergen.uuid },
                nonCodedAllergen: nonCodedAllergenType,
              }
            : {
                allergenType: allergen.type,
                codedAllergen: { uuid: allergen?.uuid },
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

              showToast({
                critical: true,
                kind: 'success',
                title: t('allergySaved', 'Allergy saved'),
                description: t('allergyNowVisible', 'It is now visible on the Allergies page'),
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
    [otherConceptUuid, patientUuid, closeWorkspace, t, mutate],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {isTablet ? (
        <Row className={styles.header}>
          <ExtensionSlot className={styles.content} name="patient-details-header-slot" state={patientState} />
        </Row>
      ) : null}
      <div className={styles.form}>
        <Stack gap={7}>
          {error ? (
            <InlineNotification
              style={{ margin: '0rem', minWidth: '100%' }}
              kind="error"
              lowContrast={true}
              title={t('errorFetchingData', 'Error fetching allergens and reactions')}
              subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
            />
          ) : null}
          <FormGroup legendText={t('allergen', 'Allergen')} data-testid="allergens-container">
            <Controller
              name="allergen"
              control={control}
              render={({ field: { value, onChange } }) => (
                <AllergenPicker allergens={allergens} selectedAllergen={value} onAllergenChange={onChange} />
              )}
            />
          </FormGroup>
          {selectedAllergen?.uuid === otherConceptUuid && (
            <ResponsiveWrapper isTablet={isTablet}>
              <Controller
                name="nonCodedAllergenType"
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextInput
                    id="nonCodedAllergenType"
                    labelText={t('otherNonCodedAllergen', 'Other non-coded allergen')}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    placeholder={t('typeAllergenName', 'Please type in the name of the allergen')}
                  />
                )}
              />
            </ResponsiveWrapper>
          )}
          <div>
            <div className={isTablet ? styles.checkboxContainer : undefined}>
              {isLoading ? (
                <InlineLoading description={`${t('loading', 'Loading')} ...`} />
              ) : (
                <FormGroup
                  legendText={t('selectReactions', 'Select the reactions')}
                  data-testid="allergic-reactions-container"
                >
                  <AllergicReactionsField allergicReactions={allergicReactions} methods={{ setValue, control }} />
                </FormGroup>
              )}
            </div>
            {selectedAllergicReactions?.includes(otherConceptUuid) ? (
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
                        placeholder={t('typeAllergicReactionName', 'Please type in the name of the allergic reaction')}
                      />
                    )}
                  />
                </ResponsiveWrapper>
              </div>
            ) : null}
          </div>
          <div>
            <FormGroup legendText={t('severityOfWorstReaction', 'Severity of worst reaction')}>
              <Controller
                name="severityOfWorstReaction"
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <RadioButtonGroup
                    name="severity-of-worst-reaction"
                    onChange={(event) => onChange(event.toString())}
                    valueSelected={value}
                    onBlur={onBlur}
                    labelText={t('severityOfWorstReaction', 'Severity of worst reaction')}
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
            </FormGroup>
          </div>
          <div>
            <ResponsiveWrapper isTablet={isTablet}>
              <Controller
                name="comment"
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextArea
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

          <ButtonSet className={isTablet ? styles.tabletButtons : styles.desktopButtons}>
            <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
              {t('discard', 'Discard')}
            </Button>
            <Button
              className={styles.button}
              disabled={
                isDisabled ||
                (selectedAllergen === otherConceptUuid && !selectedNonCodedAllergenType) ||
                (selectedAllergicReactions?.includes(otherConceptUuid) && !selectedNonCodedAllergicReaction)
              }
              type="submit"
              kind="primary"
            >
              {t('saveAndClose', 'Save and close')}
            </Button>
          </ButtonSet>
        </Stack>
      </div>
    </Form>
  );
}

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

function AllergicReactionsField({
  allergicReactions,
  methods: { control, setValue },
}: {
  allergicReactions: AllergicReaction[];
  methods: { control: Control<AllergyFormData>; setValue: UseFormSetValue<AllergyFormData> };
}) {
  const handleAllergicReactionChange = useCallback(
    (onChange, checked, id, index) => {
      onChange(id);
      setValue(`allergicReactions.${index}`, checked ? id : '', {
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const controlledFields = allergicReactions.map((reaction, index) => (
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
export default AllergyForm;
