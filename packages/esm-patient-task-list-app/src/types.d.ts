/* The fhir.CarePlan type is not completely aligned with the FHIR spec.
 * This modifies the type to align with FHIR CarePlan v4.3.0.
 * See https://r4.fhir.space/careplan.html
 */
export interface CarePlan extends fhir.CarePlan {
  created?: fhir.dateTime;
  author?: fhir.Reference;
  instantiatesCanonical?: string[];
}
