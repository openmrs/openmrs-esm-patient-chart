import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Checkbox,
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
import { type Control, Controller, useForm, type UseFormSetValue } from 'react-hook-form';
import { ExtensionSlot, showSnackbar, useConfig, useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type Allergen,
  type AllergicReaction,
  type NewAllergy,
  saveAllergy,
  updatePatientAllergy,
  useAllergens,
  useAllergicReactions,
} from './allergy-form.resource';
import { type Allergy, useAllergies } from '../allergy-intolerance.resource';
import { AllergenType } from '../../types';
import { type AllergiesConfigObject } from '../../config-schema';
import styles from './allergy-form.scss';

const allergyFormSchema = z.object({
  allergen: z
    .object({
      uuid: z.string(),
      display: z.string(),
      type: z.string(),
    })
    .required(),
  nonCodedAllergen: z.string().optional(),
  allergicReactions: z.array(z.string().optional()),
  nonCodedAllergicReaction: z.string().optional(),
  severityOfWorstReaction: z.string(),
  comment: z.string().optional(),
});

type AllergyFormData = {
  allergen: Allergen;
  nonCodedAllergen: string;
  allergicReactions: string[];
  nonCodedAllergicReaction: string;
  severityOfWorstReaction: string;
  comment: string;
};

interface AllergyFormProps extends DefaultPatientWorkspaceProps {
  allergy?: Allergy;
  formContext: 'creating' | 'editing';
}

function AllergyForm({
  closeWorkspace,
  patient,
  patientUuid,
  allergy,
  formContext,
  promptBeforeClosing,
}: AllergyFormProps) {
  const { t } = useTranslation();
  const { concepts } = useConfig<AllergiesConfigObject>();
  const isTablet = useLayoutType() === 'tablet';
  const [isDisabled, setIsDisabled] = useState(true);
  const { allergens, isLoading: isLoadingAllergens } = useAllergens();
  const { allergicReactions, isLoading } = useAllergicReactions();
  const { mutate } = useAllergies(patientUuid);

  const { mildReactionUuid, severeReactionUuid, moderateReactionUuid, otherConceptUuid } = concepts;

  const severityLevels = useMemo(
    () => [
      {
        uuid: mildReactionUuid,
        key: 'mild',
        display: t('mild', 'Mild'),
      },
      {
        uuid: moderateReactionUuid,
        key: 'moderate',
        display: t('moderate', 'Moderate'),
      },
      {
        uuid: severeReactionUuid,
        key: 'severe',
        display: t('severe', 'Severe'),
      },
    ],
    [mildReactionUuid, moderateReactionUuid, severeReactionUuid, t],
  );

  const getDefaultSeverityUUID = useCallback(
    (severity: 'mild' | 'moderate' | 'severe') => {
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
    return allergicReactions?.map((reaction) => {
      return allergy?.reactionManifestations?.includes(reaction.display) ? reaction.uuid : '';
    });
  }, [allergicReactions, allergy]);

  const setDefaultNonCodedAllergen = useCallback(
    (defaultAllergy: ReturnType<typeof getDefaultAllergy>) => {
      const codedAllergenDisplays = allergens?.map((allergen) => allergen.display);
      if (!codedAllergenDisplays?.includes(allergy?.display)) {
        defaultAllergy.allergen = { uuid: otherConceptUuid, display: t('other', 'Other'), type: AllergenType?.OTHER };
        defaultAllergy.nonCodedAllergen = allergy?.display;
      }
    },
    [allergens, allergy, otherConceptUuid, t],
  );

  const setDefaultNonCodedReactions = useCallback(
    (defaultAllergy: ReturnType<typeof getDefaultAllergy>) => {
      const allergicReactionDisplays = allergicReactions?.map((reaction) => reaction?.display);
      defaultAllergy?.reactionManifestations?.forEach((reaction) => {
        if (!allergicReactionDisplays?.includes(reaction)) {
          defaultAllergy.nonCodedAllergicReaction = reaction;
          defaultAllergy.allergicReactions?.splice(defaultAllergy.allergicReactions?.length - 1, 1, otherConceptUuid);
        }
      });
    },
    [allergicReactions, otherConceptUuid],
  );

  const getDefaultAllergy = useCallback(
    (allergy: Allergy, formContext: 'creating' | 'editing') => {
      const defaultAllergy = {
        allergen: null,
        nonCodedAllergen: '',
        allergicReactions: [],
        nonCodedAllergicReaction: '',
        severityOfWorstReaction: null,
        comment: '',
      };

      if (formContext === 'editing' && allergy) {
        const foundAllergen = allergens?.find((allergen) => allergy.display === allergen.display);
        defaultAllergy.allergen = foundAllergen ?? null;
        defaultAllergy.allergicReactions = getDefaultAllergicReactions() ?? [];
        defaultAllergy.severityOfWorstReaction = getDefaultSeverityUUID(allergy.reactionSeverity);
        defaultAllergy.comment = allergy.note !== '--' ? allergy.note : '';
        setDefaultNonCodedAllergen(defaultAllergy);
        setDefaultNonCodedReactions(defaultAllergy);
      }

      return defaultAllergy;
    },
    [
      getDefaultAllergicReactions,
      getDefaultSeverityUUID,
      setDefaultNonCodedAllergen,
      setDefaultNonCodedReactions,
      allergens,
    ],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<AllergyFormData>({
    mode: 'all',
    resolver: zodResolver(allergyFormSchema),
    defaultValues: getDefaultAllergy(allergy, formContext),
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const selectedAllergen = watch('allergen');
  const selectedAllergicReactions = watch('allergicReactions');
  const selectedSeverityOfWorstReaction = watch('severityOfWorstReaction');
  const selectednonCodedAllergen = watch('nonCodedAllergen');
  const selectedNonCodedAllergicReaction = watch('nonCodedAllergicReaction');
  const reactionsValidation = selectedAllergicReactions?.some((item) => item !== '');

  useEffect(() => {
    if (!!selectedAllergen && reactionsValidation && !!selectedSeverityOfWorstReaction) setIsDisabled(false);
    else setIsDisabled(true);
  }, [
    selectedAllergicReactions,
    watch,
    selectedAllergen,
    selectedSeverityOfWorstReaction,
    otherConceptUuid,
    selectednonCodedAllergen,
    reactionsValidation,
  ]);

  const onSubmit = useCallback(
    (data: AllergyFormData) => {
      const {
        allergen,
        comment,
        nonCodedAllergen,
        nonCodedAllergicReaction,
        allergicReactions,
        severityOfWorstReaction,
      } = data;
      const selectedAllergicReactions = allergicReactions.filter((value) => value !== '');

      let patientAllergy: NewAllergy = {
        allergen:
          allergen.uuid == otherConceptUuid
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
        reactions: selectedAllergicReactions?.map((reaction) => {
          return reaction === otherConceptUuid
            ? { reaction: { uuid: reaction }, reactionNonCoded: nonCodedAllergicReaction }
            : { reaction: { uuid: reaction } };
        }),
      };
      const abortController = new AbortController();
      return formContext === 'editing'
        ? updatePatientAllergy(patientAllergy, patientUuid, allergy?.id, abortController).then(
            () => {
              mutate();
              closeWorkspace({ ignoreChanges: true });
              showSnackbar({
                isLowContrast: true,
                kind: 'success',
                title: t('allergyUpdated', 'Allergy updated'),
                subtitle: t('allergyNowVisible', 'It is now visible on the Allergies page'),
              });
            },
            (err) => {
              showSnackbar({
                title: t('allergySaveError', 'Error saving allergy'),
                kind: 'error',
                isLowContrast: false,
                subtitle: err?.message,
              });
            },
          )
        : saveAllergy(patientAllergy, patientUuid, abortController).then(
            () => {
              mutate();
              closeWorkspace({ ignoreChanges: true });
              showSnackbar({
                isLowContrast: true,
                kind: 'success',
                title: t('allergySaved', 'Allergy saved'),
                subtitle: t('allergyNowVisible', 'It is now visible on the Allergies page'),
              });
            },
            (err) => {
              showSnackbar({
                title: t('allergySaveError', 'Error saving allergy'),
                kind: 'error',
                isLowContrast: false,
                subtitle: err?.message,
              });
            },
          );
    },
    [otherConceptUuid, patientUuid, t, mutate, allergy?.id, closeWorkspace, formContext],
  );

  const extensionSlotState = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);

  const allergenItems = useMemo(
    () => [...allergens, { uuid: otherConceptUuid, display: t('other', 'Other'), type: AllergenType.OTHER }],
    [allergens, otherConceptUuid, t],
  );

  return (
    <Form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
      {isTablet ? (
        <Row className={styles.header}>
          <ExtensionSlot className={styles.content} name="patient-details-header-slot" state={extensionSlotState} />
        </Row>
      ) : null}
      <div className={styles.form}>
        <Stack gap={7} className={styles.formContent}>
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
            <FormGroup legendText={t('allergen', 'Allergen')} data-testid="allergens-container">
              <Controller
                name="allergen"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <ComboBox
                    id="allergen"
                    itemToString={(item: Allergen) => item?.display}
                    items={allergenItems}
                    onChange={(props: { selectedItem?: Record<string, unknown> }) => {
                      if (typeof props?.selectedItem !== 'undefined') {
                        onChange(props.selectedItem);
                      }
                    }}
                    placeholder={t('selectAllergen', 'Select the allergen')}
                    selectedItem={value}
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
              <ResponsiveWrapper>
                <Controller
                  name="nonCodedAllergicReaction"
                  control={control}
                  render={({ field: { onBlur, onChange, value } }) => (
                    <TextInput
                      id="nonCodedAllergicReaction"
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
        <ButtonSet
          className={classNames(styles.actionButtons, isTablet ? styles.tabletButtons : styles.desktopButtons)}
        >
          <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={
              isSubmitting ||
              isDisabled ||
              (selectedAllergen?.uuid === otherConceptUuid && !selectednonCodedAllergen) ||
              (selectedAllergicReactions?.includes(otherConceptUuid) && !selectedNonCodedAllergicReaction)
            }
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

function AllergicReactionsField({
  allergicReactions,
  methods: { control, setValue },
}: {
  allergicReactions: AllergicReaction[];
  methods: {
    control: Control<AllergyFormData>;
    setValue: UseFormSetValue<AllergyFormData>;
  };
}) {
  const handleAllergicReactionChange = useCallback(
    (onChange: (...args: any[]) => void, checked: boolean, id: string, index: number) => {
      onChange(id);
      setValue(`allergicReactions.${index}`, checked ? id : '', {
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const controlledFields = useMemo(
    () =>
      allergicReactions.map((reaction, index) => (
        <Controller
          key={reaction.uuid}
          name={`allergicReactions.${index}`}
          control={control}
          defaultValue=""
          render={({ field: { onBlur, onChange, value } }) => (
            <Checkbox
              checked={Boolean(value)}
              className={styles.checkbox}
              id={reaction.uuid}
              labelText={reaction.display}
              onBlur={onBlur}
              onChange={(_, { checked, id }) => {
                handleAllergicReactionChange(onChange, checked, id, index);
              }}
            />
          )}
        />
      )),
    [allergicReactions, control, handleAllergicReactionChange],
  );

  return <React.Fragment>{controlledFields}</React.Fragment>;
}
export default AllergyForm;
