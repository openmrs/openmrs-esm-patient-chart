import { serializable } from './serializable.decorator';
import './date.extensions';

import { PersonAttribute } from './person-attribute.model';
import { PersonAddress } from './address.model';
import { BaseModel } from './base-model';

export class Person extends BaseModel {
  private _birthdate: Date;
  private _attributes = this.openmrsModel.attributes;
  private _convertedAttributes = [];
  private _address: PersonAddress;
  constructor(openmrsModel?: any) {
    super(openmrsModel);
  }

  @serializable()
  public get gender(): string {
    return this._openmrsModel.gender;
  }
  public set gender(v: string) {
    this._openmrsModel.gender = v;
  }

  @serializable(true, false)
  public get age(): number {
    return this._openmrsModel.age;
  }
  public set age(v: number) {
    this._openmrsModel.age = v;
  }

  @serializable()
  public get birthdate(): Date {
    if (this._birthdate === null || this._birthdate === undefined) {
      this._birthdate = new Date(this._openmrsModel.birthdate);
    }
    return this._birthdate;
  }
  public set birthdate(v: Date) {
    this._openmrsModel.birthdate = v.toServerTimezoneString();
    this._birthdate = v;
  }

  @serializable(false, true)
  public get preferredName(): string {
    return this._openmrsModel.preferredName;
  }
  public set preferredName(v: string) {
    this._openmrsModel.preferredName = v;
  }
  @serializable(true, false)
  public get attributes(): PersonAttribute {
    if (this._attributes === null || this._attributes === undefined) {
      this.initializeNavigationProperty('');
      this._attributes = new PersonAttribute(this._openmrsModel.attributes);
    }
    return this._attributes;
  }
  public set attributes(v: PersonAttribute) {
    this._openmrsModel.attributes = v.openmrsModel;
    this._attributes = v;
  }

  public get healthCenter() {
    const healthCenterPersonAttributeTypeUuid = '8d87236c-c2cc-11de-8d13-0010c6dffd0f';
    if (this._attributes) {
      const location = this.getPersonAttribute(healthCenterPersonAttributeTypeUuid);
      if (location) {
        return location.display;
      } else {
        return '';
      }
    }
  }
  public get nextofkinPhoneNumber() {
    const nextofkinPhoneNumberPersonAttributeTypeUuid = 'a657a4f1-9c0f-444b-a1fd-445bb91dd12d';
    if (this._attributes) {
      const nextofkinPhoneNumber = this.getPersonAttribute(nextofkinPhoneNumberPersonAttributeTypeUuid);
      if (nextofkinPhoneNumber) {
        return nextofkinPhoneNumber;
      } else {
        return '';
      }
    }
  }
  public get partnerPhoneNumber() {
    const partnerPhoneNumberPersonAttributeTypeUuid = 'b0a08406-09c0-4f8b-8cb5-b22b6d4a8e46';
    if (this._attributes) {
      const partnerPhoneNumber = this.getPersonAttribute(partnerPhoneNumberPersonAttributeTypeUuid);
      if (partnerPhoneNumber) {
        return partnerPhoneNumber;
      } else {
        return '';
      }
    }
  }
  public get alternativePhoneNumber() {
    const alternativePhoneNumberPersonAttributeTypeUuid = 'c725f524-c14a-4468-ac19-4a0e6661c930';
    if (this._attributes) {
      const alternativePhoneNumber = this.getPersonAttribute(alternativePhoneNumberPersonAttributeTypeUuid);
      if (alternativePhoneNumber) {
        return alternativePhoneNumber;
      } else {
        return '';
      }
    }
  }
  public get levelOfEducation() {
    const levelOfEducationPersonAttributeTypeUuid = '352b0d51-63c6-47d0-a295-156bebee4fd5';
    if (this._attributes && this._attributes.length > 0) {
      const educationPersonAttribute = this.getPersonAttribute(levelOfEducationPersonAttributeTypeUuid);
      return educationPersonAttribute ? educationPersonAttribute : null;
    }
  }
  public get patientPhoneNumber() {
    const phoneNumberPersonAttributeTypeUuid = '72a759a8-1359-11df-a1f1-0026b9348838';
    if (this._attributes) {
      const phoneNumber = this.getPersonAttribute(phoneNumberPersonAttributeTypeUuid);
      if (phoneNumber) {
        return phoneNumber;
      } else {
        return '';
      }
    }
  }
  public get caregiverName() {
    const caregiverNamePersonAttributeTypeUuid = '48876f06-7493-416e-855d-8413d894ea93';
    if (this._attributes) {
      const caregiverName = this.getPersonAttribute(caregiverNamePersonAttributeTypeUuid);
      if (caregiverName) {
        return caregiverName;
      } else {
        return '';
      }
    }
  }
  public get relationshipToCaregiver() {
    const relationshipToCaregiverPersonAttributeTypeUuid = '06b0da36-e133-4be6-aec0-31e7ed0e1ac2';
    if (this._attributes) {
      const relationshipToCaregiver = this.getPersonAttribute(relationshipToCaregiverPersonAttributeTypeUuid);
      if (relationshipToCaregiver) {
        return relationshipToCaregiver;
      } else {
        return '';
      }
    }
  }
  public get caregiverPhoneNumber() {
    const caregiverPhoneNumberPersonAttributeTypeUuid = 'bb8684a5-ac0b-4c2c-b9a5-1203e99952c2';
    if (this._attributes) {
      const caregiverPhoneNumber = this.getPersonAttribute(caregiverPhoneNumberPersonAttributeTypeUuid);
      if (caregiverPhoneNumber) {
        return caregiverPhoneNumber;
      } else {
        return '';
      }
    }
  }
  public get contacts() {
    const phoneNumberPersonAttributeTypeUuid = '72a759a8-1359-11df-a1f1-0026b9348838';
    const partnerPhoneNumberPersonAttributeTypeUuid = 'b0a08406-09c0-4f8b-8cb5-b22b6d4a8e46';
    const alternativePhoneNumberPersonAttributeTypeUuid = 'c725f524-c14a-4468-ac19-4a0e6661c930';
    const nextofkinPhoneNumberPersonAttributeTypeUuid = 'a657a4f1-9c0f-444b-a1fd-445bb91dd12d';
    const caregiverPhoneNumberPersonAttributeTypeUuid = 'bb8684a5-ac0b-4c2c-b9a5-1203e99952c2';
    if (this._attributes) {
      let filteredContacts: {};
      const partnerPhoneNumber = this.getPersonAttribute(partnerPhoneNumberPersonAttributeTypeUuid);
      const patientPhoneNumber = this.getPersonAttribute(phoneNumberPersonAttributeTypeUuid);
      const alternativePhoneNumber = this.getPersonAttribute(alternativePhoneNumberPersonAttributeTypeUuid);
      const nextofkinPhoneNumber = this.getPersonAttribute(nextofkinPhoneNumberPersonAttributeTypeUuid);
      const caregiverPhoneNumber = this.getPersonAttribute(caregiverPhoneNumberPersonAttributeTypeUuid);

      if (
        partnerPhoneNumber === undefined &&
        patientPhoneNumber === undefined &&
        alternativePhoneNumber === undefined &&
        nextofkinPhoneNumber === undefined &&
        patientPhoneNumber === undefined
      ) {
        if (this._attributes) {
          filteredContacts = { default: this._attributes };
        } else {
          filteredContacts = { default: '' };
        }
      } else {
        filteredContacts = {
          partnerPhoneNumber: partnerPhoneNumber,
          patientPhoneNumber: patientPhoneNumber,
          alternativePhoneNumber: alternativePhoneNumber,
          nextofkinPhoneNumber: nextofkinPhoneNumber,
          caregiverPhoneNumber: caregiverPhoneNumber,
        };
      }
      return filteredContacts;
    } else {
      return (this._attributes = '');
    }
  }
  public getPersonAttribute(personAttributeTypeUuid) {
    if (this._attributes.length > 0) {
      for (const i in this._attributes) {
        if (this._attributes.hasOwnProperty(i)) {
          const attr = this._attributes[i];
          if (attr.attributeType && attr.attributeType.uuid === personAttributeTypeUuid) {
            return attr.value;
          }
        }
      }
    }
  }

  public getPersonAttributeInfo(personAttributeTypeUuid) {
    if (this._attributes.length > 0) {
      for (const i in this._attributes) {
        if (this._attributes.hasOwnProperty(i)) {
          const attr = this._attributes[i];
          if (attr.attributeType && attr.attributeType.uuid === personAttributeTypeUuid) {
            return attr;
          }
        }
      }
    }
  }

  public get addresses(): PersonAddress {
    if (this._address === null || this._address === undefined) {
      this.initializeNavigationProperty('');
      this._address = new PersonAddress(this._openmrsModel.addresses);
    }
    return this._address;
  }
  public set addresses(v: PersonAddress) {
    this._openmrsModel.addresses = v.openmrsModel;
    this._address = v;
  }
  @serializable(false, true)
  public get preferredAddress(): string {
    return this._openmrsModel.preferredAddress;
  }
  public set preferredAddress(v: string) {
    this._openmrsModel.preferredAddress = v;
  }

  @serializable(true, false)
  public get dead(): boolean {
    return this._openmrsModel.dead;
  }
  public set dead(v: boolean) {
    this._openmrsModel.dead = v;
  }

  @serializable(true, false)
  public get birthdateEstimated(): boolean {
    return this._openmrsModel.birthdateEstimated;
  }
  public set birthdateEstimated(v: boolean) {
    this._openmrsModel.birthdateEstimated = v;
  }

  @serializable(true, false)
  public get deathDate(): Date {
    return this._openmrsModel.deathDate;
  }
  public set deathDate(v: Date) {
    this._openmrsModel.deathDate = v;
  }

  @serializable(true, false)
  public get causeOfDeath(): string {
    if (this._openmrsModel.causeOfDeath) {
      return this._openmrsModel.causeOfDeath.display;
    }
    return '';
  }
  public set causeOfDeath(v: string) {
    this._openmrsModel.causeOfDeath = v;
  }

  @serializable(true, false)
  public get causeOfDeathUuId(): string {
    if (this._openmrsModel.causeOfDeath) {
      return this._openmrsModel.causeOfDeath.uuid;
    }
    return '';
  }
  public set causeOfDeathUuId(v: string) {
    this._openmrsModel.causeOfDeathUuId = v;
  }
}
