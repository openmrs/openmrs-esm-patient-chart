import { calculateBMI, formatDate } from "./dimension-helpers";

export class Dimensions {
  public bmi: string;
  public weight: number | fhir.Observation;
  public height: number | fhir.Observation;
  public date: string;
  public id: number;

  constructor(
    date: string,
    weight?: fhir.Observation,
    height?: fhir.Observation
  ) {
    this.id = new Date(date).getTime();
    this.weight = weight ? weight.valueQuantity.value : weight;
    this.height = height ? height.valueQuantity.value : height;
    this.date = formatDate(date);
    if (weight && height) {
      this.bmi = calculateBMI(
        weight.valueQuantity.value,
        height.valueQuantity.value
      );
    }
  }
}
