export type OrderTypeJavaClassName = 'org.openmrs.Order' | 'org.openmrs.TestOrder' | 'org.openmrs.DrugOrder';

export interface OrderTypeResponse {
  uuid: string;
  display: string;
  name: string;
  javaClassName: OrderTypeJavaClassName;
  retired: false;
  description: string;
  conceptClasses: Array<{
    uuid: string;
    display: string;
  }>;
}
