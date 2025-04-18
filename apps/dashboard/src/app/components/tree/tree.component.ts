import { ArrayDataSource } from '@angular/cdk/collections';
import { CdkTree, CdkTreeModule } from '@angular/cdk/tree';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DUMMY_TREE_DATA, flattenNodes } from './data/dummy-tree-data';
import { NestedFoodNode } from './models/nested-food-node.model';

@Component({
  selector: 'choh-tree',
  imports: [CdkTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './tree.component.html',
})
export class TreeComponent {
  @ViewChild(CdkTree) tree: CdkTree<NestedFoodNode>;

  childrenAccessor = (dataNode: NestedFoodNode) => dataNode.children ?? [];

  dataSource = new ArrayDataSource(DUMMY_TREE_DATA);

  constructor() {
    this.tree = new CdkTree<NestedFoodNode>(
      this.dataSource,
      this.childrenAccessor
    );
  }

  hasChild = (_: number, node: NestedFoodNode) =>
    !!node.children && node.children.length > 0;

  getParentNode(node: NestedFoodNode) {
    for (const parent of flattenNodes(DUMMY_TREE_DATA)) {
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

  toggleNode(node: NestedFoodNode) {
    if (this.hasChild(0, node)) {
      this.tree.toggle(node);
    }
  }
}
