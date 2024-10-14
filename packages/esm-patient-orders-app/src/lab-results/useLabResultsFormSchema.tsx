import { z } from 'zod';
import { type LabOrderConcept, useOrderConceptByUuid } from './lab-results.resource';

type SchemaRecord = Record<string, z.ZodType>;

/**
 * Custom hook to generate a Zod schema for lab results form based on a lab order concept.
 * @param labOrderConceptUuid - The UUID of the lab order concept.
 * @returns A Zod schema object for the lab results form.
 */
export const useLabResultsFormSchema = (labOrderConceptUuid: string) => {
  const { concept, isLoading: isLoadingConcept } = useOrderConceptByUuid(labOrderConceptUuid);

  if (isLoadingConcept) {
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
  const { hiAbsolute: upperLimit, lowAbsolute: lowerLimit, datatype } = labOrderConcept;
  if (datatype.display?.toLowerCase() === 'numeric') {
    const zodObject = createNumericSchema(labOrderConcept, upperLimit, lowerLimit);

    return z.object({
      [labOrderConcept.uuid]: zodObject,
    });
  }

  return z.object({
    [labOrderConcept.uuid]: z.any(),
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
  const conceptDataType = labOrderConcept.datatype.display?.toLowerCase();
  const { hiAbsolute: upperLimit, lowAbsolute: lowerLimit } = labOrderConcept;
  if (conceptDataType === 'text') {
    return z.string().optional();
  }

  if (conceptDataType === 'numeric') {
    return createNumericSchema(labOrderConcept, upperLimit, lowerLimit);
  }

  // Default case
  return z.unknown();
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
  upperLimit: number | undefined,
  lowerLimit: number | undefined,
): z.ZodType => {
  let baseSchema = z
    .preprocess((val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const parsed = Number(val);
      return isNaN(parsed) ? undefined : parsed;
    }, z.number().optional())
    .refine((val) => val === undefined || !isNaN(val), {
      message: `${labOrderConcept.display} must be a valid number`,
    });

  if (lowerLimit === null && upperLimit === null) {
    return baseSchema;
  }

  if (lowerLimit !== null && upperLimit !== null) {
    return baseSchema.refine((val) => val === undefined || (val >= lowerLimit && val <= upperLimit), {
      message: `${labOrderConcept.display} must be between ${lowerLimit} and ${upperLimit}`,
    });
  }

  if (lowerLimit !== null) {
    return baseSchema.refine((val) => val === undefined || val >= lowerLimit, {
      message: `${labOrderConcept.display} must be greater than or equal to ${lowerLimit}`,
    });
  }

  return baseSchema.refine((val) => val === undefined || val <= upperLimit!, {
    message: `${labOrderConcept.display} must be less than or equal to ${upperLimit}`,
  });
};
