import { z } from 'zod';
import { validateClinicalNotes } from './notes-validation';

export const VitalsAndBiometricsFormSchema = z
  .object({
    systolicBloodPressure: z.number(),
    diastolicBloodPressure: z.number(),
    respiratoryRate: z.number(),
    oxygenSaturation: z.number(),
    pulse: z.number(),
    temperature: z.number(),
    generalPatientNote: z.string().refine(
      (value) => !value || validateClinicalNotes(value).isValid,
      (value) => {
        const validation = validateClinicalNotes(value);
        return {
          message: validation.errorMessage || 'notes.invalidCharacters',
        };
      },
    ),
    weight: z.number(),
    height: z.number(),
    midUpperArmCircumference: z.number(),
    computedBodyMassIndex: z.number(),
  })
  .partial()
  .refine(
    (fields) => {
      return Object.values(fields).some((value) => Boolean(value));
    },
    {
      message: 'Please fill at least one field',
      path: ['oneFieldRequired'],
    },
  );

export type VitalsBiometricsFormData = z.infer<typeof VitalsAndBiometricsFormSchema>;
