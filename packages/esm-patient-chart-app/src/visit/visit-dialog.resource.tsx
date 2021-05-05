import { Subject, Observable } from 'rxjs';

const modalItem = new Subject<ModalItem>();

export function newModalItem(item: ModalItem) {
  modalItem.next(item);
}

export function getModalItem(): Observable<ModalItem> {
  return modalItem.asObservable();
}

export interface ModalItem {
  component: React.ReactNode;
  name: any;
  props: any;
}
