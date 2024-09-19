import { type Options } from 'react-barcode';
import { type AllowedPatientFields } from '../config-schema';
import {
  PatientAddress,
  PatientAge,
  PatientContact,
  type PatientDetailProps,
  PatientDob,
  PatientGender,
  PatientIdentifier,
  PatientName,
} from './patient-detail.component';

export const defaultBarcodeParams: Options = {
  width: 2,
  background: '#f4f4f4',
  displayValue: true,
  renderer: 'img',
  font: 'IBM Plex Sans',
  textAlign: 'center',
  textPosition: 'bottom',
  fontSize: 16,
};

export function getPatientField(field: AllowedPatientFields): React.FC<PatientDetailProps> {
  switch (field) {
    case 'name':
      return PatientName;
    case 'age':
      return PatientAge;
    case 'dob':
      return PatientDob;
    case 'gender':
      return PatientGender;
    case 'identifier':
      return PatientIdentifier;
    case 'contact':
      return PatientContact;
    case 'address':
      return PatientAddress;
    default:
      console.error(`Invalid patient field: ${field}`);
      return null;
  }
}
