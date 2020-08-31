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

export class ErrorUserNotFoundByToken extends ChickenhanError {
  constructor() {
    super(403, 'No user', "Didn't find user by token");

    this.code = 403;
    this.name = 'No user';
    this.desc = "Didn't find user by token";
  }
}

export class ErrorDb extends ChickenhanError {
  constructor() {
    super(502, 'DB died', 'Something wrong with db');

    this.code = 502;
    this.name = 'DB died';
    this.desc = 'Something wrong with db';
  }
}
