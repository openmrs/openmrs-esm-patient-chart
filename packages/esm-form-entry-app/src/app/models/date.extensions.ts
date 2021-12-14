interface Date {
  toServerTimezoneString(): string;
}

Date.prototype.toServerTimezoneString = function (): string {
  return this.toISOString();
};
