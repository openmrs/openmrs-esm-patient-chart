import { BehaviorSubject } from 'rxjs';

//This is a work around until attach function is re-worked to enable passing of props
interface immunizationFormSubProps {
  immunizationObsUuid: string;
  vaccineName: string;
  vaccineUuid: string;
  manufacturer: string;
  expirationDate: string;
  vaccinationDate: string;
  sequences: any;
  lotNumber: string;
  currentDose: any;
  existingDoses: any;
  formChanged: any;
}
export const immunizationFormSub = new BehaviorSubject<immunizationFormSubProps | null>(null);
