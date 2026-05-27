import { faker } from '@faker-js/faker';
import { pascalCase } from 'es-toolkit';

export function generateName() {
  const adj = pascalCase(faker.word.adjective());
  const animal = pascalCase(faker.animal.type());
  return adj + animal;
}
