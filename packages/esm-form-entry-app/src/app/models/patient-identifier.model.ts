import { serializable, serialize } from './serializable.decorator';
import { PatientIdentifierType } from './patient-identifier-type.model';
import { BaseModel } from './base-model';

export class PatientIdentifier extends BaseModel {
  private _identifier: PatientIdentifierType;
  constructor(openmrsModel?: any) {
    super(openmrsModel);
  }

  @serializable()
  public get identifierType(): PatientIdentifierType {
    if (this._identifier === null || this._identifier === undefined) {
      this.initializeNavigationProperty('identifierType');
      this._identifier = new PatientIdentifierType(this._openmrsModel.identifierType);
    }
    return this._identifier;
  }
  public set identifierType(v: PatientIdentifierType) {
    this._openmrsModel.identifierType = v.openmrsModel;
    this._identifier = v;
  }

  @serializable()
  public get identifier(): string {
    return this._openmrsModel.identifier;
  }
  public set identifier(v: string) {
    this._openmrsModel.identifier = v;
  }
}
