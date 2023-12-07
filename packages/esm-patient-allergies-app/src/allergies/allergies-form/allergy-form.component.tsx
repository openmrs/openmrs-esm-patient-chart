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
import {
  type AllergensAndAllergicReactions,
  type NewAllergy,
  saveAllergy,
  useAllergensAndAllergicReactions,
} from './allergy-form.resource';
import { useAllergies } from '../allergy-intolerance.resource';
import styles from './allergy-form.scss';

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
  
  useEffect(() => {
    const reactionsValidation = watch('allergicReactions')?.some((item) => item !== '');
    if (!!selectedAllergen && reactionsValidation && !!severityOfWorstReaction) setIsDisabled(false);
    else setIsDisabled(true);
  }, [watch, selectedAllergen, severityOfWorstReaction, otherConceptUuid, nonCodedAllergenType]);

  function AllergicReactionsField({
    allergensAndAllergicReactions,
    methods: { control, setValue, watch },
  }: {
    allergensAndAllergicReactions: AllergensAndAllergicReactions;
    methods: { control: Control<AllergyFormData>; setValue: UseFormSetValue<AllergyFormData>; watch: UseFormWatch<AllergyFormData> };
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
            checked={watch(`allergicReactions.${index}`) === reaction.uuid}
            onBlur={onBlur}
          />
        )}
      />
    ));
  
    return <React.Fragment>{controlledFields}</React.Fragment>;
  }