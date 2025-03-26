import { ExampleItem, ExampleJson } from '../../models';

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
