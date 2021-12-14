import { serializable } from './serializable.decorator';
import { PersonAttributeType } from './person-attribute-type.model';
import { BaseModel } from './base-model';

export class PersonAttribute extends BaseModel {
  private _attributeType: PersonAttributeType;

  constructor(openmrsModel?: any) {
    super(openmrsModel);
  }

  @serializable(true, false)
  public get attributeType(): PersonAttributeType {
    if (this._attributeType === null || this._attributeType === undefined) {
      this.initializeNavigationProperty('');
      this._attributeType = new PersonAttributeType(this._openmrsModel.attributeType);
    }
    return this._attributeType;
  }

  public set attributeType(v: PersonAttributeType) {
    this._openmrsModel.attributeType = v.openmrsModel;
    this._attributeType = v;
  }
}
