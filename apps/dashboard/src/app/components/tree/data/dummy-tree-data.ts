import { NestedFoodNode } from '../models/nested-food-node.model';

export function flattenNodes(nodes: NestedFoodNode[]): NestedFoodNode[] {
  const flattenedNodes = [];
  for (const node of nodes) {
    flattenedNodes.push(node);
    if (node.children) {
      flattenedNodes.push(...flattenNodes(node.children));
    }
  }
  return flattenedNodes;
}

export const DUMMY_TREE_DATA: NestedFoodNode[] = [
  {
    name: '.bash_history',
    type: 'file',
    children: [],
  },
  {
    name: '.bashrc',
    type: 'file',
    children: [],
  },
  {
    name: '.cache',
    type: 'folder',
    children: [],
  },
  {
    name: '.forever',
    type: 'folder',
    children: [],
  },
  {
    name: '.npm',
    type: 'folder',
    children: [],
  },
  {
    name: '.profile',
    type: 'file',
    children: [],
  },
  {
    name: '.sudo_as_admin_successful',
    type: 'file',
    children: [],
  },
  {
    name: 'myApp',
    type: 'folder',
    children: [
      {
        name: 'RelayServer.js',
        type: 'file',
        children: [],
      },
      {
        name: 'main-hello-real-world.js',
        type: 'file',
        children: [],
      },
      {
        name: 'node_modules',
        type: 'folder',
        children: [
          {
            name: '.bin',
            type: 'folder',
            children: [],
          },
          {
            name: 'package-lock.json',
            type: 'file',
            children: [],
          },
        ],
      },
      {
        name: 'package-lock.json',
        type: 'file',
        children: [],
      },
      {
        name: 'package.json',
        type: 'file',
        children: [],
      },
    ],
  },
  {
    name: 'wifi_setup.sh',
    type: 'file',
    children: [],
  },
];
