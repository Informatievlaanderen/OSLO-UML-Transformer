/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-extraneous-class */
// This must be a class, because it must be possible to extend it in implementations
export class ServiceIdentifier {
  public static readonly Service = Symbol.for('Service');
  public static readonly Configuration = Symbol.for('Configuration');
  public static readonly OutputHandler = Symbol.for('OutputHandler');
  public static readonly Logger = Symbol.for('Logger');
  public static readonly QuadStore = Symbol.for('QuadStore');
}
