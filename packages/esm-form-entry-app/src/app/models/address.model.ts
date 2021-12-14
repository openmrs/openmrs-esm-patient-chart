import { BaseModel } from './base-model';
import { serializable } from './serializable.decorator';

export class PersonAddress extends BaseModel {
  constructor(openmrsModel?: any) {
    super(openmrsModel);
  }

  @serializable()
  public get preferred(): string {
    return this._openmrsModel.preferred;
  }
  public set preferred(v: string) {
    this._openmrsModel.preferred = v;
  }
  @serializable()
  public get address1(): string {
    return this._openmrsModel.address1;
  }
  public set address1(v: string) {
    this._openmrsModel.address1 = v;
  }
  @serializable()
  public get address2(): string {
    return this._openmrsModel.address2;
  }
  public set address2(v: string) {
    this._openmrsModel.address2 = v;
  }
  @serializable()
  public get address3(): string {
    return this._openmrsModel.address3;
  }
  public set address3(v: string) {
    this._openmrsModel.address3 = v;
  }
  @serializable()
  public get address4(): string {
    return this._openmrsModel.address4;
  }
  public set address4(v: string) {
    this._openmrsModel.address4 = v;
  }
  @serializable()
  public get address5(): string {
    return this._openmrsModel.address5;
  }
  public set address5(v: string) {
    this._openmrsModel.address5 = v;
  }
  @serializable()
  public get address6(): string {
    return this._openmrsModel.address6;
  }
  public set address6(v: string) {
    this._openmrsModel.address6 = v;
  }
  @serializable()
  public get cityVillage(): string {
    return this._openmrsModel.cityVillage;
  }
  public set cityVillage(v: string) {
    this._openmrsModel.cityVillage = v;
  }
  @serializable()
  public get stateProvince(): string {
    return this._openmrsModel.stateProvince;
  }
  public set stateProvince(v: string) {
    this._openmrsModel.stateProvince = v;
  }
  @serializable()
  public get country(): string {
    return this._openmrsModel.country;
  }
  public set country(v: string) {
    this._openmrsModel.country = v;
  }
  @serializable()
  public get countyDistrict(): string {
    return this._openmrsModel.countyDistrict;
  }
  public set countyDistrict(v: string) {
    this._openmrsModel.countyDistrict = v;
  }
  @serializable()
  public get postalCode(): string {
    return this._openmrsModel.postalCode;
  }
  public set postalCode(v: string) {
    this._openmrsModel.postalCode = v;
  }
}
