import { ExampleJson } from './example.model';

export interface ExampleItem extends ExampleJson {
  js: string;
  circuit: string;
  link: string;
}
