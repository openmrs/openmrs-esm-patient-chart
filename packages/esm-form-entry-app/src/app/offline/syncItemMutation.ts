import { validate as validateUuid } from 'uuid';
import { Encounter, EncounterCreate } from '../types';

// General note about this file:
// Here, we generally provide object transformations which convert an entity from the REST API's
// POST format to the format of the GET format.
//
// At the example of encounters, the conversion is required because:
// 1) Other modules display encounter data based on the GET format.
//    When they read out sync items, they will require that format (and not the POST format).
// 2) The form engine, when editing an offline encounter from the sync item, also expects the GET format.
//    It cannot fill the fields from the {@link EncounterCreate} format.
//
// In general, we transform how UUIDs are represented in the objects.
// Again, at the example of an encounter:
// An EncounterCreate (for POST /encounter) formats UUIDs like this:
// {
//   encounterType: "e22e39fd-7db2-45e7-80f1-60fa0d5a4378",
//   obs: [
//     { concept: "e22e39fd-7db2-45e7-80f1-60fa0d5a0000" }
//   ],
//   ...
// }
//
// When retrieving the (posted) entity from the API, it will, however, look like this:
// {
//   encounterType: { uuid: "e22e39fd-7db2-45e7-80f1-60fa0d5a4378" },
//   obs: [
//     { concept: { uuid: "e22e39fd-7db2-45e7-80f1-60fa0d5a0000" } }
//   ],
//   ...
// }
//
// The second format is the one that most other components expect. While offline, we must therefore
// manually do this conversion so that other modules (and this includes the form engine in this same module)
// can appropriately do their jobs.
//
// This is obviously an error-prone process and can, naturally, be the source of unforseen issues.
// If submission of offline forms fail for some reason (and if the same form values *can* be submitted while online)
// the transformation process here should most likely be the first thing to be investigated.

/**
 * Mutates the given {@link encounterCreate} value to the format of an {@link Encounter},
 * i.e. the format that the REST API returns when GETting the same encounter.
 *
 * @param encounterCreate The {@link EncounterCreate} to be mutated.
 * @returns The same {@link encounterCreate} instance.
 *   Be aware that this is only a partial encounter since API-generated properties are missing
 *   when doing the mutation locally without the servier (-> the types are misleading).
 */
export function mutateEncounterCreateToPartialEncounter(encounterCreate: EncounterCreate): Partial<Encounter> {
  recursivelyMutateAllUuidLikeStrings(encounterCreate);

  // Some known properties are problematic and (usually) not caught by the automatic object walking above.
  // Examples here are the `concept` attributes of observations. These are documented as UUIDs, but can
  // have non-UUID values like "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA".
  // This list can easily be expanded in the future if other props also cause issues when syncing.
  for (const path of ['obs.concept']) {
    mutateUuidStringToObjectAtPath(encounterCreate, path);
  }

  return encounterCreate as unknown as Encounter;
}

/**
 * Walks the given value and transforms all pure strings which are UUIDs (as determined by {@link validateUuid})
 * into the special UUID object syntax.
 *
 * This process automatically covers most UUIDs (i.e. those that follow the conventional UUID syntax).
 * The rest (i.e. abnormal UUID values) must be manually converted.
 */
function recursivelyMutateAllUuidLikeStrings(value: any) {
  if (typeof value === 'object') {
    for (const [propKey, propValue] of Object.entries(value)) {
      if (propKey !== 'uuid' && typeof propValue === 'string' && validateUuid(propValue as string)) {
        mutateUuidStringToObject(value, propKey);
      } else if (typeof propValue === 'object') {
        recursivelyMutateAllUuidLikeStrings(propValue);
      }
    }
  } else if (Array.isArray(value)) {
    for (const inner of value) {
      recursivelyMutateAllUuidLikeStrings(inner);
    }
  }

  return value;
}

/**
 * Mutates the property of the given object at the given path from a pure string to a UUID object.
 * @param value The root object to be converted.
 * @param path The path to be converted. Basically follows lodash's syntax, but handles arrays differently.
 *   Example: 'foo.array.bar'.
 */
function mutateUuidStringToObjectAtPath(value: any, path: string) {
  const [currentPathSegment, ...remainingPathSegments] = path.split('.');

  if (remainingPathSegments.length === 0) {
    mutateUuidStringToObject(value, currentPathSegment);
    return;
  }

  const nextValue = value?.[currentPathSegment];
  if (Array.isArray(nextValue)) {
    for (const value of nextValue) {
      mutateUuidStringToObjectAtPath(value, remainingPathSegments.join('.'));
    }
  } else if (typeof nextValue === 'object') {
    mutateUuidStringToObjectAtPath(nextValue, remainingPathSegments.join('.'));
  }
}

/**
 * Mutates a key of the given object from a pure string to a UUID object.
 *
 * Example:
 * ```ts
 * const obj = { foo: 'ABC' };
 * mutateUuidStringToObject(obj, 'foo');
 *
 * // obj is now:
 * {
 *   foo: {
 *     uuid: 'ABC',
 *   }
 * }
 * ```
 * @param value The object where UUID string attribute should be transformed to an object.
 * @param keyToTransform The key of the attribute to be transformed.
 */
function mutateUuidStringToObject(value: unknown, keyToTransform: string) {
  if (typeof value === 'object' && typeof value[keyToTransform] === 'string') {
    value[keyToTransform] = { uuid: value[keyToTransform] };
  }
  return value;
}
