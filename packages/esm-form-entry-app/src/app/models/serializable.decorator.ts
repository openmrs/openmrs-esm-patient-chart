/* tslint:disable:forin */
declare var Reflect: any;

import { BaseModel } from './base-model';
import './date.extensions';

export const METADATA_KEY_SERIALIZABLE = 'SERIALIZABLE';

export interface SerializableProperty {
  key: string;
  name: string;
  addToNewPayload: boolean;
  addToUpdatePayload: boolean;
}

export function serializable(addToNewPayload: boolean = true, addToUpdatePayload: boolean = true, name?: string) {
  return (target: any, key: any) => {
    Reflect.defineMetadata(
      'SERIALIZABLE',
      {
        key: key,
        name: name || key,
        addToNewPayload: addToNewPayload,
        addToUpdatePayload: addToUpdatePayload,
      },
      target,
      key,
    );
  };
}

export function getSerializables(target: any): Array<SerializableProperty> {
  const serializables: Array<any> = [];

  for (const key in target) {
    const metadata = Reflect.getMetadata(METADATA_KEY_SERIALIZABLE, target, key);

    if (metadata) {
      serializables.push(metadata);
    }
  }

  return serializables;
}

export function serialize(target: any, newPayload: boolean, prototype?: any): object {
  return getSerializables(prototype || target).reduce((prev: any, prop: SerializableProperty) => {
    const isBaseModel = target[prop.key] instanceof BaseModel;
    const baseModelVersion = target[prop.key] as BaseModel;
    const isOpenmrsDate = target[prop.key] instanceof Date;
    const openmrsDate = target[prop.key] as Date;

    if (newPayload) {
      if (prop.addToNewPayload) {
        prev[prop.name] =
          isBaseModel || isOpenmrsDate
            ? isOpenmrsDate
              ? openmrsDate.toServerTimezoneString()
              : baseModelVersion.uuid
            : target[prop.key];
      }
    } else {
      if (prop.addToUpdatePayload) {
        prev[prop.name] =
          isBaseModel || isOpenmrsDate
            ? isOpenmrsDate
              ? openmrsDate.toServerTimezoneString()
              : baseModelVersion.uuid
            : target[prop.key];
      }
    }
    return prev;
  }, {});
}
