export class Result<T, E = Error> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Can't get the value of an error result. Use 'errorValue' instead.`);
    }

    return this._value as T;
  }

  public getError(): E {
    if (!this.isFailure) {
      throw new Error(`Can't get the error of a success result. Use 'value' instead.`);
    }

    return this._error as E;
  }

  public static ok<U>(value?: U): Result<U, never> {
    return new Result<U, never>(true, undefined, value);
  }

  public static fail<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, error);
  }

  public static combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const errors = results.filter(result => result.isFailure);
    
    if (errors.length > 0) {
      return Result.fail<E>(errors[0]!.getError());
    }

    const values = results.map(result => result.getValue());
    return Result.ok(values);
  }
}