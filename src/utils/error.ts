export class ChickenhanError {
  public code: number;
  public name: string;
  public desc: string;

  constructor(code: number, name: string, desc: string) {
    this.code = code;
    this.name = name;
    this.desc = desc;
  }
}

export class ErrorNotFound extends ChickenhanError {
  constructor(desc: string) {
    super(404, 'Not found', desc);

    this.code = 404;
    this.name = 'Not found';
    this.desc = desc;
  }
}
