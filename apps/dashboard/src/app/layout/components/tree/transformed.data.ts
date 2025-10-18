import { RawData } from './raw-data';

export class TransformedData {
  constructor(public raw: RawData) {}

  areChildrenLoading() {
    return this.raw.childrenLoading === 'LOADING';
  }

  isExpandable() {
    return (
      (this.raw.childrenLoading === 'INIT' ||
        this.raw.childrenLoading === 'LOADED') &&
      !!this.raw.childrenIds?.length
    );
  }

  isLeaf() {
    return !this.isExpandable() && !this.areChildrenLoading();
  }
}
