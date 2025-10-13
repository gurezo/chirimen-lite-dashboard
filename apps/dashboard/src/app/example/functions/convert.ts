import { ExampleItem } from '../models/example.item.model';
import { ExampleJson } from '../models/example.model';

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
