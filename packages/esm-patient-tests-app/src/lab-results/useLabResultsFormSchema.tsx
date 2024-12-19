import { z } from 'zod';
import { type LabOrderConcept, useOrderConceptByUuid } from '@openmrs/esm-patient-common-lib';

type SchemaRecord = Record<string, z.ZodType>;

/**
 * Custom hook to generate a Zod schema for lab results form based on a lab order concept.
 * @param labOrderConceptUuid - The UUID of the lab order concept.
 * @returns A Zod schema object for the lab results form.
 */
export const useLabResultsFormSchema = (labOrderConceptUuid: string) => {
  const { concept, isLoading: isLoadingConcept } = useOrderConceptByUuid(labOrderConceptUuid);

  if (isLoadingConcept || !concept) {
    if (!concept) {
      console.warn(`Couldn't load concept ${labOrderConceptUuid}`);
    }
    return z.object({});
  }

  const setMembers = concept?.setMembers ?? [];

  if (setMembers.length > 0) {
    return createSetMembersSchema(setMembers);
  }

  return createSingleConceptSchema(concept);
};

/**
 * Creates a Zod schema for a single lab order concept.
 * @param labOrderConcept - The lab order concept to create a schema for.
 * @returns A Zod schema object for the single concept.
 */
const createSingleConceptSchema = (labOrderConcept: LabOrderConcept) => {
  const {
    hiAbsolute: upperLimit,
    lowAbsolute: lowerLimit,
    datatype: { hl7Abbreviation },
  } = labOrderConcept;

  let zodObject: z.ZodType;

  switch (hl7Abbreviation) {
    // hl7Abbreviation for numeric is NM
    case 'NM':
      zodObject = createNumericSchema(labOrderConcept, upperLimit, lowerLimit);
      break;
    default:
      zodObject = z.any();
  }

  return z.object({
    [labOrderConcept.uuid]: zodObject,
  });
};

/**
 * Creates a Zod schema for a set of lab order concepts.
 * @param labOrderConcepts - An array of lab order concepts.
 * @returns A Zod schema object for the set of concepts.
 */
const createSetMembersSchema = (labOrderConcepts: Array<LabOrderConcept>): z.ZodObject<SchemaRecord> => {
  const schema = z.object(
    labOrderConcepts.reduce<SchemaRecord>((acc, member) => {
      acc[member.uuid] = createSchema(member);
      return acc;
    }, {}),
  );

  return schema;
};

/**
 * Determines and returns the appropriate Zod schema for a given lab order concept.
 * @param labOrderConcept - The lab order concept to create a schema for.
 * @returns A Zod schema type based on the concept's data type.
 */
const createSchema = (labOrderConcept: LabOrderConcept): z.ZodType => {
  const {
    hiAbsolute: upperLimit,
    lowAbsolute: lowerLimit,
    datatype: { hl7Abbreviation },
  } = labOrderConcept;

  switch (hl7Abbreviation) {
    case 'ST':
      return z.string().optional();
    case 'NM':
      return createNumericSchema(labOrderConcept, upperLimit, lowerLimit);
    default:
      return z.any();
  }
};

/**
 * Creates a Zod schema for a numeric lab order concept, including validation for upper and lower limits.
 * @param labOrderConcept - The lab order concept to create a schema for.
 * @param upperLimit - The upper limit for the numeric value.
 * @param lowerLimit - The lower limit for the numeric value.
 * @returns A Zod schema type with appropriate numeric validations.
 */
const createNumericSchema = (
  labOrderConcept: LabOrderConcept,
  upperLimit: number | null | undefined,
  lowerLimit: number | null | undefined,
): z.ZodType => {
  const { allowDecimal, display } = labOrderConcept;
  const processNumber = (val: unknown) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const parsed = Number(val);
    if (isNaN(parsed)) return undefined;
    return parsed;
  };

  let baseSchema = z
    .preprocess(processNumber, z.number().optional())
    .refine((val) => val === undefined || !isNaN(val), {
      message: `${display} must be a valid number`,
    })
    .refine(
      (val) => {
        if (val === undefined) return true;
        if (!allowDecimal) {
          return Number.isInteger(val);
        }
        return true;
      },
      {
        message: !allowDecimal ? `${display} must be a whole number` : `${display} must be a valid number`,
      },
    );

  // Add range validations
  const hasLowerLimit = lowerLimit !== null && lowerLimit !== undefined;
  const hasUpperLimit = upperLimit !== null && upperLimit !== undefined;

  if (!hasLowerLimit && !hasUpperLimit) {
    return baseSchema;
  }

  if (hasLowerLimit && hasUpperLimit) {
    return baseSchema.refine((val) => val === undefined || (val >= lowerLimit && val <= upperLimit), {
      message: `${display} must be between ${lowerLimit} and ${upperLimit}`,
    });
  }

  if (hasLowerLimit) {
    return baseSchema.refine((val) => val === undefined || val >= lowerLimit, {
      message: `${display} must be greater than or equal to ${lowerLimit}`,
    });
  }

  if (hasUpperLimit) {
    return baseSchema.refine((val) => val === undefined || val <= upperLimit, {
      message: `${display} must be less than or equal to ${upperLimit}`,
    });
  }
};
