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

export class ErrorWrongBody extends ChickenhanError {
  constructor(desc: string) {
    super(400, 'Wrong body', desc);

    this.code = 400;
    this.name = 'Wrong body';
    this.desc = desc;
  }
}

export class ErrorWrongQueryParams extends ChickenhanError {
  constructor(desc: string) {
    super(400, 'Wrong query params', desc);

    this.code = 400;
    this.name = 'Wrong query params';
    this.desc = desc;
  }
}
