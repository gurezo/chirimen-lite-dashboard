export interface NestedFoodNode {
  name: string;
  type: 'file' | 'folder';
  children?: NestedFoodNode[];
}
