import { ArrayDataSource } from '@angular/cdk/collections';
import { CdkTree, CdkTreeModule } from '@angular/cdk/tree';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FOOD_DATA, flattenNodes } from './data/food-data';
import { NestedFoodNode } from './models/nested-food-node.model';

@Component({
  selector: 'choh-tree',
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
})
export class TreeComponent {
  @ViewChild(CdkTree) tree: CdkTree<NestedFoodNode>;

  childrenAccessor = (dataNode: NestedFoodNode) => dataNode.children ?? [];

  dataSource = new ArrayDataSource(FOOD_DATA);

  constructor() {
    this.tree = new CdkTree<NestedFoodNode>(
      this.dataSource,
      this.childrenAccessor
    );
  }

  hasChild = (_: number, node: NestedFoodNode) =>
    !!node.children && node.children.length > 0;

  getParentNode(node: NestedFoodNode) {
    for (const parent of flattenNodes(FOOD_DATA)) {
      if (parent.children?.includes(node)) {
        return parent;
      }
    }

    return null;
  }

  shouldRender(node: NestedFoodNode): boolean {
    // This node should render if it is a root node or if all of its ancestors are expanded.
    const parent = this.getParentNode(node);
    return (
      !parent || (!!this.tree?.isExpanded(parent) && this.shouldRender(parent))
    );
  }
}
