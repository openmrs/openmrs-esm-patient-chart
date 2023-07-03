export const getFlagType = (tags: Array<{ display: string; uuid: string }>) => {
  const flagTypeKind = tags.find((t) => t.display.includes('flag type'));
  const type = flagTypeKind.display.split('-')[1];
  return type;
};
