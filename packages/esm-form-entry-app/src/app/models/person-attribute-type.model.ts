import { BaseModel } from './base-model';
import { serializable } from './serializable.decorator';
export class PersonAttributeType extends BaseModel {
  // private name: string;
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
