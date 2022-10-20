export class ServiceIdentifier {
  static readonly ConversionService = Symbol.for('ConversionService');
  static readonly Configuration = Symbol.for('Configuration');
  static readonly OutputHandler = Symbol.for('OutputHandler');
}
