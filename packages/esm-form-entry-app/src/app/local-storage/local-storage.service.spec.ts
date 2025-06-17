import { LocalStorageService } from './local-storage.service';
import { TestBed } from '@angular/core/testing';

describe('LocalStorageService Tests', () => {
  let service: LocalStorageService;
  const keyName = 'localStorageServiceTest.value';
  const value = 'some value to be stored';
  const objectValue = {
    property1: 'localStorage wrapper',
    property2: 'another property',
  };
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should store a given value', () => {
    service.setItem(keyName, value);
    let v;
    try {
      v = window.localStorage.getItem(keyName);
    } catch (e) {
      console.error('Error getting item', e);
    }
    expect(v).toEqual(value);
  });
  it('should return the correct length of localStorage', () => {
    window.localStorage.setItem(keyName, 'some value');
    expect(service.storageLength).toEqual(1);
  });

  it('should store javascript object literals', () => {
    service.setObject(keyName, objectValue);
    const stored = window.localStorage.getItem(keyName);
    expect(JSON.parse(stored)).toEqual(objectValue);
  });
  it('should retrieve a stored value', () => {
    try {
      window.localStorage.setItem(keyName, value);
    } catch (e) {
      console.error('Error getting item', e);
    }
    expect(service.getItem(keyName)).toEqual(value);
  });
  it('should remove an existing item', () => {
    window.localStorage.setItem(keyName, 'some value');
    service.remove(keyName);
    expect(window.localStorage.getItem(keyName)).toBeNull();
  });
  it('should clear localStorage', () => {
    service.clear();
    expect(window.localStorage.length).toEqual(0);
  });

  it('should retrieve the stored javascript object literal', () => {
    window.localStorage.setItem(keyName, JSON.stringify(objectValue));
    expect(service.getObject(keyName)).toEqual(objectValue);
  });
});
