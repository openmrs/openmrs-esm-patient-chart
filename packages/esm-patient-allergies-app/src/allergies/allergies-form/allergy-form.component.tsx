import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
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
import { type Control, Controller, useForm, type UseFormSetValue, type UseFormGetValues } from 'react-hook-form';
import {
  ExtensionSlot,
  type FetchResponse,
  showSnackbar,
  useConfig,
  useLayoutType,
  ResponsiveWrapper,
} from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  type Allergen,
  type AllergicReaction,
  type NewAllergy,
  saveAllergy,
  useAllergens,
  useAllergicReactions,
  updatePatientAllergy,
} from './allergy-form.resource';
import { type Allergy, useAllergies } from '../allergy-intolerance.resource';
import { AllergenType } from '../../types';
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

interface AllergyFormProps extends DefaultWorkspaceProps {
  allergy?: Allergy;
  formContext: 'creating' | 'editing';
}

function AllergyForm(props: AllergyFormProps) {
  const { closeWorkspace, patientUuid, allergy, formContext, promptBeforeClosing, closeWorkspaceWithSavedChanges } =
    props;
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
  const [isDisabled, setIsDisabled] = useState(true);
  const { mutate } = useAllergies(patientUuid);

  const getDefaultAllergy = (allergy: Allergy, formContext) => {
    const defaultAllergy = {
      allergen: null,
      nonCodedAllergen: '',
      allergicReactions: [],
      nonCodedAllergicReaction: '',
      severityOfWorstReaction: null,
      comment: '',
    };
    if (formContext === 'editing') {
      defaultAllergy.allergen = allergens?.find((a) => allergy?.display === a?.display);
      defaultAllergy.allergicReactions = allergicReactions?.map((reaction) => {
        return allergy?.reactionManifestations?.includes(reaction.display) ? reaction.uuid : '';
      });
      switch (allergy?.reactionSeverity) {
        case 'mild':
          defaultAllergy.severityOfWorstReaction = mildReactionUuid;
          break;
        case 'moderate':
          defaultAllergy.severityOfWorstReaction = moderateReactionUuid;
          break;
        case 'severe':
          defaultAllergy.severityOfWorstReaction = severeReactionUuid;
          break;
        default:
          defaultAllergy.severityOfWorstReaction = null;
      }
      defaultAllergy.comment = allergy?.note !== '--' ? allergy?.note : '';

      const codedAllergenDisplays = allergens?.map((allergen) => allergen?.display);

      if (!codedAllergenDisplays?.includes(allergy?.display)) {
        defaultAllergy.allergen = { uuid: otherConceptUuid, display: t('other', 'Other'), type: AllergenType?.OTHER };
        defaultAllergy.nonCodedAllergen = allergy?.display;
      }

      const allergicReactionDisplays = allergicReactions?.map((reaction) => reaction?.display);
      allergy?.reactionManifestations?.forEach((reaction) => {
        if (!allergicReactionDisplays?.includes(reaction)) {
          defaultAllergy.nonCodedAllergicReaction = reaction;
          defaultAllergy.allergicReactions?.splice(defaultAllergy.allergicReactions?.length - 1, 1, otherConceptUuid);
        }
      });
    }
    return defaultAllergy;
  };
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { isDirty },
  } = useForm<AllergyFormData>({
    mode: 'all',
    resolver: zodResolver(allergyFormSchema),
    values: getDefaultAllergy(allergy, formContext),
  });

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty]);

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
        comment,
        reactions: selectedAllergicReactions?.map((reaction) => {
          return reaction === otherConceptUuid
            ? { reaction: { uuid: reaction }, reactionNonCoded: nonCodedAllergicReaction }
            : { reaction: { uuid: reaction } };
        }),
      };
      const abortController = new AbortController();
      formContext === 'editing'
        ? updatePatientAllergy(patientAllergy, patientUuid, allergy?.id, abortController)
            .then(
              (response: FetchResponse) => {
                if (response.status === 200) {
                  mutate();
                  closeWorkspace({ ignoreChanges: true });
                  showSnackbar({
                    isLowContrast: true,
                    kind: 'success',
                    title: t('allergySaved', 'Allergy saved'),
                    subtitle: t('allergyNowVisible', 'It is now visible on the Allergies page'),
                  });
                }
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
            .finally(() => abortController.abort())
        : saveAllergy(patientAllergy, patientUuid, abortController)
            .then(
              (response: FetchResponse) => {
                if (response.status === 201) {
                  mutate();
                  closeWorkspace({ ignoreChanges: true });
                  showSnackbar({
                    isLowContrast: true,
                    kind: 'success',
                    title: t('allergySaved', 'Allergy saved'),
                    subtitle: t('allergyNowVisible', 'It is now visible on the Allergies page'),
                  });
                }
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
            .finally(() => abortController.abort());
    },
    [otherConceptUuid, patientUuid, closeWorkspaceWithSavedChanges, t, mutate],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {isTablet ? (
        <Row className={styles.header}>
          <ExtensionSlot className={styles.content} name="patient-details-header-slot" state={patientState} />
        </Row>
      ) : null}
      <div className={styles.form}>
        <Stack gap={7} className={styles.formContent}>
          {selectedAllergen?.uuid === otherConceptUuid && (
            <InlineNotification
              style={{ minWidth: '100%' }}
              kind="warning"
              lowContrast={true}
              hideCloseButton={true}
              title={t('nonCodedAllergenWarningTitle', 'Warning: Custom Allergen Entry')}
              subtitle={t(
                'nonCodedAllergenWarningDescription',
                "Adding a custom allergen may impact system-wide allergy notifications. It's recommended to choose from the provided list for accurate alerts. Custom entries may not trigger notifications in all relevant contexts.",
              )}
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
                    items={[
                      ...allergens,
                      { uuid: otherConceptUuid, display: t('other', 'Other'), type: AllergenType.OTHER },
                    ]}
                    itemToString={(item: Allergen) => item?.display}
                    placeholder={t('selectAllergen', 'Select the allergen')}
                    selectedItem={value}
                    onChange={({ selectedItem }) => onChange(selectedItem)}
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
                <ResponsiveWrapper>
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
            <ResponsiveWrapper>
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
        </Stack>
        <ButtonSet
          className={classNames(isTablet ? styles.tabletButtons : styles.desktopButtons, styles.actionButtons)}
        >
          <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={
              isDisabled ||
              (selectedAllergen?.uuid === otherConceptUuid && !selectednonCodedAllergen) ||
              (selectedAllergicReactions?.includes(otherConceptUuid) && !selectedNonCodedAllergicReaction)
            }
            type="submit"
            kind="primary"
          >
            {t('saveAndClose', 'Save and close')}
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
