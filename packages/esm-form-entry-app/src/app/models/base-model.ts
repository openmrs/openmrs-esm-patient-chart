/**
 * BaseModel
 */
import { serializable, serialize } from './serializable.decorator';

export abstract class BaseModel {
  constructor(protected _openmrsModel?: any) {
    if (_openmrsModel === undefined || _openmrsModel === null) {
      _openmrsModel = {};
    }
  }

  @serializable(true, false)
  public get uuid(): string {
    return this._openmrsModel.uuid;
  }
  public set uuid(v: string) {
    this._openmrsModel.uuid = v;
  }

  public get display(): string {
    return this._openmrsModel.display;
  }

  public get openmrsModel(): any {
    return this._openmrsModel;
  }

  public toNewPayload(): any {
    return serialize(this, true);
  }

  public toUpdatePayload(): any {
    return serialize(this, false);
  }

  protected initializeNavigationProperty(member: string) {
    if (this._openmrsModel[member] === undefined || this._openmrsModel[member] === null) {
      this._openmrsModel[member] = {};
    }
  }
}
