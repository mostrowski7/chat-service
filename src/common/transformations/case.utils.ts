import { InternalServerErrorException } from '@nestjs/common/exceptions';

export const snakeToCamelCase = (text: string) => {
  if (typeof text !== 'string')
    throw new InternalServerErrorException('The value is not of type string');

  return text.replaceAll(/_[a-z]{1}/g, (match) =>
    match.split('').pop().toUpperCase(),
  );
};

export const camelToSnakeCase = (text: string) => {
  if (typeof text !== 'string')
    throw new InternalServerErrorException('The value is not of type string');

  return text.replaceAll(/[A-Z]/g, (match) => '_' + match.toLowerCase());
};

export const transformObjectPropertiesCase = (
  object: { [k: string]: string },
  method: (property: string) => string,
): { [k: string]: string } => {
  if (object.constructor !== Object || Object.entries(object).length === 0)
    throw new InternalServerErrorException(
      'Input data must be an object with at least one key-value pair',
    );

  const newObject = {};

  for (const [key, value] of Object.entries(object)) {
    const changedKey = method(`${key}`);
    newObject[changedKey] = value;
  }

  return newObject;
};
