import '@testing-library/jest-dom';

window.URL.createObjectURL = jest.fn();
window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';
