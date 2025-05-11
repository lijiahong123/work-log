export class BaseService {
  resData(res?: any) {
    return {
      code: 0,
      data: res || null,
      msg: 'ok',
    };
  }
}
