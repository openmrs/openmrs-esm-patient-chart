window.System = {
  register: jest.fn(),
  import: jest.fn()
};

window.getOpenmrsSpaBase = function() {
  return "/openmrs/spa";
};
