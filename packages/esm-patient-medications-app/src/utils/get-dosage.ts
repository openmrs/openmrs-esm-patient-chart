export function getDosage(strength, doseNumber) {
  if (!strength || !doseNumber) {
    return '';
  }

  const i = strength.search(/\D/);
  const strengthQuantity = strength.substring(0, i);

  const concentrationStartIndex = strength.search(/\//);

  let strengthUnits = strength.substring(i);
  let dosage;

  if (concentrationStartIndex >= 0) {
    strengthUnits = strength.substring(i, concentrationStartIndex);
    const j = strength.substring(concentrationStartIndex + 1).search(/\D/);
    const concentrationQuantity = strength.substr(concentrationStartIndex + 1, j);
    const concentrationUnits = strength.substring(concentrationStartIndex + 1 + j);
    dosage = `${doseNumber} ${strengthUnits} (${
      (doseNumber / strengthQuantity) * concentrationQuantity
    } ${concentrationUnits})`;
  } else {
    dosage = strengthQuantity * doseNumber + ' ' + strengthUnits;
  }
  return dosage;
}
