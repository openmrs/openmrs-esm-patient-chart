import { type Obs, restBaseUrl } from '@openmrs/esm-framework';

/**
 * A complex obs as the REST API returns it when the representation asks for `valueComplex` and
 * `comment`. The framework's `Obs` type does not carry `valueComplex`.
 */
export type ComplexObs = Obs & { valueComplex?: string | null };

const ATTACHMENTS_PREFIX = 'm3ks';
const METADATA_SEPARATOR = ' | ';
const KEY_SEPARATOR = ' |';
const CORE_TYPE_SUFFIXES = [' image', ' file'];

export function isAttachmentObs(obs: ComplexObs): boolean {
  return typeof obs.valueComplex === 'string' && obs.valueComplex.length > 0;
}

/**
 * Pulls the original file name out of an obs `valueComplex`. Mirrors the parsing in the attachments
 * module's ValueComplex, which stores `m3ks | instructions | mime type | file name |storage key`, and
 * falls back to core's own `file name image |storage key` layout for obs the module did not write.
 */
export function getAttachmentFileName(obs: ComplexObs): string {
  const valueComplex = obs.valueComplex ?? '';
  const parts = valueComplex.split(METADATA_SEPARATOR);
  let fileNameAndKey: string;

  if (parts[0] === ATTACHMENTS_PREFIX) {
    // instructions and mime type come first; whatever remains is the file name plus an optional key
    fileNameAndKey = parts.slice(3).join(METADATA_SEPARATOR);
  } else {
    fileNameAndKey = valueComplex;
  }

  let fileName = / \|\S/.test(fileNameAndKey) ? fileNameAndKey.split(KEY_SEPARATOR)[0] : fileNameAndKey;

  for (const suffix of CORE_TYPE_SUFFIXES) {
    if (fileName.endsWith(suffix)) {
      fileName = fileName.slice(0, -suffix.length);
    }
  }

  // older attachments carry the obs uuid in the stored name, e.g. scan_<uuid>.png
  if (obs.uuid) {
    fileName = fileName.replace(`_${obs.uuid}`, '');
  }

  return fileName.trim();
}

/** The caption if the user gave one, otherwise the file name. */
export function getAttachmentLabel(obs: ComplexObs): string {
  return obs.comment?.trim() || getAttachmentFileName(obs);
}

export function getAttachmentUrl(obs: ComplexObs): string {
  return `${window.openmrsBase}${restBaseUrl}/attachment/${obs.uuid}/bytes`;
}
