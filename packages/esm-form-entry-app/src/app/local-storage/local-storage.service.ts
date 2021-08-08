import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  public getItem(keyName: string): string {
    return window.localStorage.getItem(keyName);
  }

  public setItem(keyName: string, value: string): void {
    window.localStorage.setItem(keyName, value);
  }

  public getObject(keyName: string): any {
    const stored = window.localStorage.getItem(keyName);
    try {
      const object = JSON.parse(stored);
      return object;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public setObject(keyName: string, value: any) {
    window.localStorage.setItem(keyName, JSON.stringify(value));
  }

  public remove(keyName: string): void {
    window.localStorage.removeItem(keyName);
  }

  public clear(): void {
    window.localStorage.clear();
  }

  get storageLength(): number {
    return window.localStorage.length;
  }
}
