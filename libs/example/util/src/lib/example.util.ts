import type { ExampleJson, ExampleItem } from '@libs-shared-types';

export type { ExampleJson, ExampleItem } from '@libs-shared-types';

export function convertExampleJsonToList(
  jsonList: ExampleJson[]
): ExampleItem[] {
  return jsonList.map((json: ExampleJson) => ({
    ...json,
    js: '',
    circuit: '',
    link: '',
  }));
}
