import { z } from 'zod';
import { type LabOrderConcept, useOrderConceptByUuid } from './lab-results.resource';

type SchemaRecord = Record<string, z.ZodType>;

function createSchemaForConcept(labOrderConcept: LabOrderConcept): SchemaRecord {
  const schema = {};
  const conceptSchema = createSchema(labOrderConcept);
  if (conceptSchema) {
    schema[labOrderConcept.uuid] = conceptSchema;
  }

  const setMembersSchema = labOrderConcept.set
    ? labOrderConcept.setMembers.reduce((acc, member) => {
        return {
          ...acc,
          ...createSchemaForConcept(member),
        };
      }, {})
    : {};

  return {
    ...schema,
    ...setMembersSchema,
  };
}

/**
 * Custom hook to generate a Zod schema for lab results form based on a lab order concept.
 * @param labOrderConceptUuid - The UUID of the lab order concept.
 * @returns A Zod schema object for the lab results form.
 */
export const createLabResultsFormSchema = (labOrderConcepts: LabOrderConcept) => {
  if (!labOrderConcepts) {
    return z.object({});
  }
  const schema = createSchemaForConcept(labOrderConcepts);

  return z.object(schema);
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
    case 'CWE': {
      const answers = labOrderConcept.answers?.map((answer) => answer.uuid) ?? [];
      return answers.length > 0 ? z.enum(answers as [string, ...string[]]).optional() : z.string().optional();
    }
    default:
      return null;
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
