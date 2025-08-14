interface Tag {
  display: string;
  uuid: string;
}

export const getFlagType = (tags: Array<Tag>) => {
  const flagTypeKind = tags.find((tag) => tag.display.toLowerCase().includes('flag type'));
  if (flagTypeKind) {
    return flagTypeKind.display.split('-')[1]?.trim() ?? undefined;
  }
  return undefined;
};
