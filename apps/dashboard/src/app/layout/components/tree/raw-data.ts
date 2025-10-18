import { LoadingState } from './loading.state';

export interface RawData {
  id: string;
  name: string;
  parentId?: string;
  childrenIds?: string[];
  childrenLoading: LoadingState;
}
