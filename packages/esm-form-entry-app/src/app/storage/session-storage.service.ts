import { Injectable } from '@angular/core';

const storage = window.sessionStorage;

@Injectable()
export class SessionStorageService {
  public getItem(keyName: string): string {
    return storage.getItem(keyName);
  }

  public setItem(keyName: string, value: string): void {
    storage.setItem(keyName, value);
  }

  public getObject<T = any>(keyName: string): T | null {
    const stored = storage.getItem(keyName);
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public setObject(keyName: string, value: unknown) {
    storage.setItem(keyName, JSON.stringify(value));
  }

  public remove(keyName: string): void {
    storage.removeItem(keyName);
  }

  get storageLength(): number {
    return storage.length;
  }
}
