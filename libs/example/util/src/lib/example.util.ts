export interface ExampleJson {
  id: string;
  title: string;
  overview: string;
}

export interface ExampleItem extends ExampleJson {
  js: string;
  circuit: string;
  link: string;
}

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
