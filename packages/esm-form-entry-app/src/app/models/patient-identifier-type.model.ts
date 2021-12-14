import { BaseModel } from './base-model';
import { serializable, serialize } from './serializable.decorator';

export class PatientIdentifierType extends BaseModel {
  constructor(openmrsModel?: any) {
    super(openmrsModel);
  }

  @serializable()
  public get name(): string {
    return this._openmrsModel.name;
  }
  public set name(v: string) {
    this._openmrsModel.name = v;
  }
}
