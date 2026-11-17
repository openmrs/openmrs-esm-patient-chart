import { type Attachment, type Obs } from '@openmrs/esm-framework';
import { getAttachmentBytesUrl } from '@openmrs/esm-patient-common-lib';

/**
 * A complex obs as the REST API returns it when the representation asks for `valueComplex` and
 * `comment`. The framework's `Obs` type does not carry `valueComplex`.
 */
export type ComplexObs = Obs & { valueComplex?: string | null };

const ATTACHMENTS_PREFIX = 'm3ks';
const METADATA_SEPARATOR = ' | ';
const KEY_SEPARATOR = ' |';
const CORE_TYPE_SUFFIXES = [' image', ' file'];

/**
 * True only for complex obs the attachments module wrote, recognised by its marker at the start of
 * `valueComplex`. Complex obs from other handlers keep their normal display.
 */
export function isAttachmentObs(obs: ComplexObs): boolean {
  return (
    typeof obs.valueComplex === 'string' && obs.valueComplex.startsWith(`${ATTACHMENTS_PREFIX}${METADATA_SEPARATOR}`)
  );
}

/**
 * Pulls the original file name out of an obs `valueComplex`. Follows the layouts the attachments
 * module's ValueComplex writes, `m3ks | instructions | mime type | file name |storage key` and the
 * older form without a key, and falls back to core's own `file name image |storage key` layout for
 * obs the module did not write.
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

/** The mime type the attachments module recorded, or an empty string for obs it did not write. */
export function getAttachmentMimeType(obs: ComplexObs): string {
  const parts = (obs.valueComplex ?? '').split(METADATA_SEPARATOR);
  return parts[0] === ATTACHMENTS_PREFIX && parts.length > 2 ? parts[2].trim() : '';
}

function getContentFamily(mimeType: string): Attachment['bytesContentFamily'] {
  if (mimeType.startsWith('image/')) {
    return 'IMAGE';
  }
  if (mimeType === 'application/pdf') {
    return 'PDF';
  }
  return 'OTHER';
}

/** Shapes the obs the way the attachments app's preview expects an attachment. */
export function toAttachment(obs: ComplexObs): Attachment {
  const mimeType = getAttachmentMimeType(obs);
  return {
    id: obs.uuid,
    src: getAttachmentBytesUrl(obs.uuid),
    filename: getAttachmentFileName(obs),
    description: obs.comment?.trim() || undefined,
    dateTime: obs.obsDatetime,
    bytesMimeType: mimeType,
    bytesContentFamily: getContentFamily(mimeType),
  };
}
