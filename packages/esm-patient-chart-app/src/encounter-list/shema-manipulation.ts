export function extractSchemaValues(schema) {
  const result = {};
  function traverse(obj) {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return;
    }
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          traverse(value);
        } else {
          result[key] = value;
        }
      }
    });
  }

  traverse(schema);
  return result;
}

export function replaceWithConfigDefaults(obj, configDefaults) {
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'string' && configDefaults.hasOwnProperty(item)) {
        return configDefaults[item];
      } else {
        return replaceWithConfigDefaults(item, configDefaults);
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (configDefaults.hasOwnProperty(key)) {
          // Case where UUID is the value
          newObj[configDefaults[key]] = obj[key];
        } else if (configDefaults.hasOwnProperty(obj[key])) {
          // Case where UUID is the key
          newObj[key] = configDefaults[obj[key]];
        } else {
          newObj[key] = obj[key];
        }
      } else {
        newObj[key] = replaceWithConfigDefaults(obj[key], configDefaults);
      }
    }
    return newObj;
  } else {
    return obj;
  }
}
