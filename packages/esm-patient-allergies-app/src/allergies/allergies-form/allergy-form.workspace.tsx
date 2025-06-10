import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useTranslation, type TFunction } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Checkbox,
  CheckboxGroup,
  CheckboxSkeleton,
  ComboBox,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Row,
  Stack,
  TextArea,
  TextInput,
} from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ExtensionSlot, showSnackbar, useConfig, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type Allergen,
  type NewAllergy,
  saveAllergy,
  updatePatientAllergy,
  useAllergens,
  useAllergicReactions,
} from './allergy-form.resource';
import { useAllergies } from '../allergy-intolerance.resource';
import { type AllergiesConfigObject } from '../../config-schema';
import { ALLERGEN_TYPES, type Allergy } from '../../types';
import styles from './allergy-form.scss';

interface AllergyFormData {
  allergen: Allergen;
  allergicReactions: string[];
  comment: string;
  nonCodedAllergen: string;
  nonCodedAllergicReaction: string;
  severityOfWorstReaction: string;
}

interface AllergyFormProps extends DefaultPatientWorkspaceProps {
  allergy?: Allergy;
  formContext: 'creating' | 'editing';
}

interface DefaultAllergy {
  allergen: Allergen | null;
  allergicReactions: string[];
  comment: string;
  nonCodedAllergen: string;
  nonCodedAllergicReaction: string;
  reactionManifestations?: string[];
  severityOfWorstReaction: string | null;
}

interface FormValues {
  allergen: Allergen | null;
  allergicReactions: string[];
  comment: string;
  nonCodedAllergen: string;
  nonCodedAllergicReaction: string;
  severityOfWorstReaction: string | null;
}

type Severity = 'mild' | 'moderate' | 'severe';

const allergyFormSchema = (t: TFunction, otherConceptUuid: string) =>
  z
    .object({
      // Ensure an allergen is selected
      allergen: z
        .object({
          display: z.string(),
          type: z.string(),
          uuid: z.string(),
        })
        .nullable()
        .refine((val) => val !== null, {
          message: t('allergenRequired', 'Allergen is required'),
        }),
      nonCodedAllergen: z.string().optional(),
      // Ensure at least one allergic reaction is selected
      allergicReactions: z.array(z.string().optional()).refine((val) => val.some((item) => item !== ''), {
        message: t('atLeastOneReactionRequired', 'At least one reaction is required'),
      }),
      nonCodedAllergicReaction: z.string().optional(),
      // Ensure severity is selected
      severityOfWorstReaction: z
        .string()
        .nullable()
        .refine((val) => val !== null && val !== '', {
          message: t('severityRequired', 'Severity is required'),
        }),
      comment: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // If "other" allergen is selected, ensure a non-coded allergen is provided
      if (data.allergen?.uuid === otherConceptUuid && !data.nonCodedAllergen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('nonCodedAllergenRequired', 'Please specify the non-coded allergen'),
          path: ['nonCodedAllergen'],
        });
      }
      // If "other" allergic reaction is selected, ensure a non-coded allergic reaction is provided
      if (data.allergicReactions?.includes(otherConceptUuid) && !data.nonCodedAllergicReaction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('nonCodedAllergicReactionRequired', 'Please specify the non-coded allergic reaction'),
          path: ['nonCodedAllergicReaction'],
        });
      }
    });

function AllergyForm({
  closeWorkspace,
  patient,
  patientUuid,
  allergy,
  formContext,
  promptBeforeClosing,
}: AllergyFormProps) {
  const { allergens } = useAllergens();
  const { allergicReactions, isLoading: isLoadingReactions } = useAllergicReactions();
  const { concepts } = useConfig<AllergiesConfigObject>();
  const { mutate } = useAllergies(patientUuid);
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const formValuesLoadedRef = useRef(false);

  const { mildReactionUuid, moderateReactionUuid, otherConceptUuid, severeReactionUuid } = useMemo(
    () => concepts,
    [concepts],
  );

  const severityLevels = useMemo(
    () => [
      {
        display: t('mild', 'Mild'),
        key: 'mild',
        uuid: mildReactionUuid,
      },
      {
        display: t('moderate', 'Moderate'),
        key: 'moderate',
        uuid: moderateReactionUuid,
      },
      {
        display: t('severe', 'Severe'),
        key: 'severe',
        uuid: severeReactionUuid,
      },
    ],
    [mildReactionUuid, moderateReactionUuid, severeReactionUuid, t],
  );

  const getDefaultSeverityUuid = useCallback(
    (severity: Severity) => {
      switch (severity) {
        case 'mild':
          return mildReactionUuid;
        case 'moderate':
          return moderateReactionUuid;
        case 'severe':
          return severeReactionUuid;
        default:
          return null;
      }
    },
    [mildReactionUuid, moderateReactionUuid, severeReactionUuid],
  );

  const getDefaultAllergicReactions = useCallback(() => {
    if (!allergicReactions?.length || !allergy?.reactionManifestations?.length) {
      return [];
    }

    return allergicReactions
      .filter((reaction) => allergy.reactionManifestations.includes(reaction.display))
      .map((reaction) => reaction.uuid);
  }, [allergy, allergicReactions]);

  const setDefaultNonCodedAllergen = useCallback(
    (values: FormValues, existingAllergy: Allergy | null): FormValues => {
      const codedAllergenDisplays = allergens?.map((allergen) => allergen.display);

      if (existingAllergy && !codedAllergenDisplays?.includes(existingAllergy.display)) {
        return {
          ...values,
          allergen: {
            uuid: otherConceptUuid,
            display: t('other', 'Other'),
            type: ALLERGEN_TYPES.OTHER,
          },
          nonCodedAllergen: existingAllergy.display,
        };
      }
      return values;
    },
    [allergens, otherConceptUuid, t],
  );

  const setDefaultNonCodedAllergicReactions = useCallback(
    (values: FormValues, existingAllergy: Allergy | null): FormValues => {
      if (!existingAllergy?.reactionManifestations?.length) {
        return values;
      }

      const codedReactionDisplays = allergicReactions?.map((reaction) => reaction.display);
      const nonCodedReaction = existingAllergy.reactionManifestations.find(
        (reaction) => !codedReactionDisplays?.includes(reaction),
      );

      if (nonCodedReaction) {
        return {
          ...values,
          allergicReactions: [...values.allergicReactions, otherConceptUuid],
          nonCodedAllergicReaction: nonCodedReaction,
        };
      }

      return values;
    },
    [allergicReactions, otherConceptUuid],
  );

  const getAllergyFormDefaultValues = useCallback(
    (allergy: Allergy | null, formContext: 'creating' | 'editing'): FormValues => {
      const defaultValues: FormValues = {
        allergen: null,
        nonCodedAllergen: '',
        allergicReactions: [],
        nonCodedAllergicReaction: '',
        severityOfWorstReaction: null,
        comment: '',
      };

      if (!allergy || formContext !== 'editing') {
        return defaultValues;
      }

      // Initialize with base values
      const initialValues: FormValues = {
        ...defaultValues,
        allergen: allergens?.find((allergen) => allergy.display === allergen.display) ?? null,
        allergicReactions: getDefaultAllergicReactions(),
        severityOfWorstReaction: getDefaultSeverityUuid(allergy.reactionSeverity),
        comment: allergy.note !== '--' ? allergy.note : '',
      };

      // Apply transformations in sequence
      const valuesWithAllergen = setDefaultNonCodedAllergen(initialValues, allergy);
      const finalValues = setDefaultNonCodedAllergicReactions(valuesWithAllergen, allergy);

      return finalValues;
    },
    [
      allergens,
      getDefaultAllergicReactions,
      getDefaultSeverityUuid,
      setDefaultNonCodedAllergen,
      setDefaultNonCodedAllergicReactions,
    ],
  );

  const {
    control,
    formState: { isDirty, isSubmitting, errors },
    handleSubmit,
    setValue,
  } = useForm<AllergyFormData>({
    mode: 'all',
    resolver: zodResolver(allergyFormSchema(t, otherConceptUuid)),
    defaultValues: getAllergyFormDefaultValues(allergy, formContext),
  });

  useEffect(() => {
    if (!formValuesLoadedRef.current && !isLoadingReactions && allergy && formContext === 'editing') {
      const defaultValues = getAllergyFormDefaultValues(allergy, formContext);

      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof AllergyFormData, value);
      });

      formValuesLoadedRef.current = true;
    }
  }, [allergy, formContext, getAllergyFormDefaultValues, isLoadingReactions, setValue]);

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [promptBeforeClosing, isDirty]);

  const selectedAllergen = useWatch({
    control,
    name: 'allergen',
  });

  const selectedAllergicReactions = useWatch({
    control,
    name: 'allergicReactions',
  });

  const createAllergyPayload = useCallback(
    (data: AllergyFormData): NewAllergy => {
      const {
        allergen,
        allergicReactions,
        comment,
        nonCodedAllergen,
        nonCodedAllergicReaction,
        severityOfWorstReaction,
      } = data;

      const selectedAllergicReactions = allergicReactions.filter(Boolean);

      return {
        allergen:
          allergen.uuid === otherConceptUuid
            ? {
                allergenType: allergen.type,
                codedAllergen: { uuid: allergen.uuid },
                nonCodedAllergen: nonCodedAllergen,
              }
            : {
                allergenType: allergen.type,
                codedAllergen: { uuid: allergen.uuid },
              },
        severity: {
          uuid: severityOfWorstReaction,
        },
        comment: comment,
        reactions: selectedAllergicReactions.map((reaction) =>
          reaction === otherConceptUuid
            ? { reaction: { uuid: reaction }, reactionNonCoded: nonCodedAllergicReaction }
            : { reaction: { uuid: reaction } },
        ),
      };
    },
    [otherConceptUuid],
  );

  const onSubmit = useCallback(
    (data: AllergyFormData) => {
      const abortController = new AbortController();
      const allergyPayload = createAllergyPayload(data);

      const handleSuccess = () => {
        mutate();
        closeWorkspace({ ignoreChanges: true });
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          title:
            formContext === 'editing' ? t('allergyUpdated', 'Allergy updated') : t('allergySaved', 'Allergy saved'),
          subtitle: t('allergyNowVisible', 'It is now visible on the Allergies page'),
        });
      };

      const handleError = (err: Error) => {
        const errorMessage = err.message;
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: t('allergySaveError', 'Error saving allergy'),
          subtitle: errorMessage,
        });
      };

      return formContext === 'editing'
        ? updatePatientAllergy(allergyPayload, patientUuid, allergy?.id, abortController).then(
            handleSuccess,
            handleError,
          )
        : saveAllergy(allergyPayload, patientUuid, abortController).then(handleSuccess, handleError);
    },
    [allergy?.id, closeWorkspace, createAllergyPayload, formContext, mutate, patientUuid, t],
  );

  const extensionSlotState = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);

  const allergenItems = useMemo(
    () => [...allergens, { uuid: otherConceptUuid, display: t('other', 'Other'), type: ALLERGEN_TYPES.OTHER }],
    [allergens, otherConceptUuid, t],
  );

  const allergicReactionsItems = useMemo(
    () =>
      allergicReactions
        ?.sort((a, b) => a.display.localeCompare(b.display))
        .map((reaction) => ({
          id: reaction.uuid,
          labelText: reaction.display,
        })),
    [allergicReactions],
  );

  return (
    <Form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      {isTablet ? (
        <Row className={styles.header}>
          <ExtensionSlot className={styles.content} name="patient-details-header-slot" state={extensionSlotState} />
        </Row>
      ) : null}
      <div className={styles.form}>
        {isLoadingReactions ? (
          <div className={styles.loaderContainer}>
            <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
          </div>
        ) : (
          <Stack gap={5} className={styles.formContent}>
            {selectedAllergen?.uuid === otherConceptUuid && (
              <InlineNotification
                hideCloseButton
                kind="warning"
                lowContrast
                style={{ minWidth: '100%' }}
                subtitle={t(
                  'nonCodedAllergenWarningDescription',
                  "Adding a custom allergen may impact system-wide allergy notifications. It's recommended to choose from the provided list for accurate alerts. Custom entries may not trigger notifications in all relevant contexts.",
                )}
                title={t('nonCodedAllergenWarningTitle', 'Warning: Custom Allergen Entry')}
              />
            )}
            <ResponsiveWrapper>
              <FormGroup legendText="">
                <Controller
                  name="allergen"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <ComboBox
                      id="allergen"
                      invalid={!!errors.allergen}
                      invalidText={errors.allergen?.message}
                      itemToString={(item: unknown) => (item as Allergen)?.display}
                      items={allergenItems as unknown as Array<Record<string, unknown>>}
                      onChange={(props: { selectedItem?: unknown }) => {
                        if (typeof props?.selectedItem !== 'undefined') {
                          onChange(props.selectedItem as Allergen);
                        }
                      }}
                      placeholder={t('selectAllergen', 'Select the allergen')}
                      selectedItem={value as unknown as Allergen}
                      titleText={t('allergen', 'Allergen')}
                    />
                  )}
                />
              </FormGroup>
            </ResponsiveWrapper>
            {selectedAllergen?.uuid === otherConceptUuid && (
              <ResponsiveWrapper>
                <Controller
                  name="nonCodedAllergen"
                  control={control}
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      id="nonCodedAllergen"
                      invalid={!!errors.nonCodedAllergen}
                      invalidText={errors.nonCodedAllergen?.message}
                      labelText={t('otherNonCodedAllergen', 'Other non-coded allergen')}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder={t('typeAllergenName', 'Please type in the name of the allergen')}
                      value={value}
                    />
                  )}
                />
              </ResponsiveWrapper>
            )}
            <>
              <div className={classNames({ [styles.checkboxContainer]: isTablet })}>
                <FormGroup legendText="" data-testid="allergic-reactions-container">
                  {isLoadingReactions ? (
                    <>
                      {Array.from({ length: 10 }).map((_, index) => (
                        <CheckboxSkeleton key={`checkbox-skeleton-${index}`} />
                      ))}
                    </>
                  ) : (
                    <Controller
                      name="allergicReactions"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <CheckboxGroup
                          invalid={!!errors.allergicReactions}
                          invalidText={errors.allergicReactions?.message}
                          legendText={t('selectReactions', 'Select the reactions')}
                        >
                          {allergicReactionsItems.map(({ id, labelText }) => (
                            <Checkbox
                              checked={Array.isArray(value) && value.includes(id)}
                              className={styles.checkbox}
                              id={id}
                              key={id}
                              labelText={labelText}
                              onChange={(_, { checked, id }) => {
                                const currentValue = Array.isArray(value) ? value : [];
                                onChange(checked ? [...currentValue, id] : currentValue.filter((item) => item !== id));
                              }}
                            />
                          ))}
                        </CheckboxGroup>
                      )}
                    />
                  )}
                </FormGroup>
              </div>
              {selectedAllergicReactions?.includes(otherConceptUuid) ? (
                <ResponsiveWrapper>
                  <Controller
                    name="nonCodedAllergicReaction"
                    control={control}
                    render={({ field: { onBlur, onChange, value } }) => (
                      <TextInput
                        id="nonCodedAllergicReaction"
                        invalid={!!errors.nonCodedAllergicReaction}
                        invalidText={errors.nonCodedAllergicReaction?.message}
                        labelText={t('otherNonCodedAllergicReaction', 'Other non-coded allergic reaction')}
                        onBlur={onBlur}
                        onChange={onChange}
                        placeholder={t('typeAllergicReactionName', 'Please type in the name of the allergic reaction')}
                        value={value}
                      />
                    )}
                  />
                </ResponsiveWrapper>
              ) : null}
            </>
            <FormGroup legendText={t('severityOfWorstReaction', 'Severity of worst reaction')}>
              <Controller
                name="severityOfWorstReaction"
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <RadioButtonGroup
                    name="severity-of-worst-reaction"
                    invalid={!!errors.severityOfWorstReaction}
                    invalidText={errors.severityOfWorstReaction?.message}
                    onBlur={onBlur}
                    onChange={(event) => onChange(event.toString())}
                    valueSelected={value}
                  >
                    {severityLevels.map(({ key, display, uuid }) => (
                      <RadioButton id={key} key={key} labelText={display} value={uuid} />
                    ))}
                  </RadioButtonGroup>
                )}
              />
            </FormGroup>

            <ResponsiveWrapper>
              <Controller
                name="comment"
                control={control}
                render={({ field: { onBlur, onChange, value } }) => (
                  <TextArea
                    id="comments"
                    labelText={t('comments', 'Comments')}
                    onChange={onChange}
                    placeholder={t('typeAdditionalComments', 'Type any additional comments here')}
                    onBlur={onBlur}
                    value={value}
                    rows={4}
                  />
                )}
              />
            </ResponsiveWrapper>
          </Stack>
        )}
        <ButtonSet
          className={classNames(styles.actionButtons, isTablet ? styles.tabletButtons : styles.desktopButtons)}
        >
          <Button className={styles.button} onClick={() => closeWorkspace({ ignoreChanges: true })} kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={isSubmitting || (formContext === 'editing' && isLoadingReactions)}
            kind="primary"
            type="submit"
          >
            {isSubmitting ? (
              <InlineLoading description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save and close')}</span>
            )}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
}

export default AllergyForm;
