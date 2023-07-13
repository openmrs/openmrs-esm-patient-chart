interface Tag {
  display: string;
  uuid: string;
}

export const getFlagType = (tags: Array<Tag>) => {
  const flagTypeKind = tags.find((tag) => tag.display.includes('flag type'));
  const type = flagTypeKind.display.split('-')[1];
  return type;
};
