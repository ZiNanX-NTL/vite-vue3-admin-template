import { routeModel, userModel } from '../model';

/** 参数错误的状态码 */
const ERROR_PARAM_CODE = 10000;

const ERROR_PARAM_MSG = '参数校验失败！';

const apis = [
  // 用户+密码 登录
  {
    url: '/mock/login',
    method: 'post',
    response: options => {
      const { userName = undefined, password = undefined } = options.body;

      if (!userName || !password) {
        return {
          code: ERROR_PARAM_CODE,
          message: ERROR_PARAM_MSG,
          data: null
        };
      }

      const findItem = userModel.find(item => item.userName === userName && item.password === password);

      if (findItem) {
        return {
          code: 200,
          message: 'ok',
          data: {
            token: findItem.token,
            refreshToken: findItem.refreshToken
          }
        };
      }
      return {
        code: 1000,
        message: '用户名或密码错误！',
        data: null
      };
    }
  },
  // 获取用户信息(请求头携带token, 根据token获取用户信息)
  {
    url: '/mock/getUserInfo',
    method: 'get',
    response: options => {
      // 这里的mock插件得到的字段是authorization, 前端传递的是Authorization字段
      const { authorization = '' } = options.headers;
      const REFRESH_TOKEN_CODE = 66666;

      if (!authorization) {
        return {
          code: REFRESH_TOKEN_CODE,
          message: '用户已失效或不存在！',
          data: null
        };
      }
      const userInfo = {
        userId: '',
        userName: '',
        userRole: 'user',
        userPermissions: []
      };
      const isInUser = userModel.some(item => {
        const flag = item.token === authorization;
        if (flag) {
          const { userId, userName, userRole, userPermissions } = item;
          Object.assign(userInfo, { userId, userName, userRole, userPermissions });
        }
        return flag;
      });

      if (isInUser) {
        return {
          code: 200,
          message: 'ok',
          data: userInfo
        };
      }

      return {
        code: REFRESH_TOKEN_CODE,
        message: '用户信息异常！',
        data: null
      };
    }
  },
  // 获取用户权限菜单(请求头携带token, 根据token获取用户菜单)
  {
    url: '/mock/getUserRoutes',
    method: 'get',
    response: options => {
      // 这里的mock插件得到的字段是authorization, 前端传递的是Authorization字段
      const { authorization = '' } = options.headers;
      const REFRESH_TOKEN_CODE = 66666;

      if (!authorization) {
        return {
          code: REFRESH_TOKEN_CODE,
          message: '用户已失效或不存在！',
          data: null
        };
      }
      const routeHomeName = 'plant-overview';

      const role = userModel.find(item => item.token === authorization)?.userRole || userModel[0]?.userRole;

      const filterRoutes = routeModel[role[0]];

      return {
        code: 200,
        message: 'ok',
        data: {
          routes: filterRoutes,
          home: routeHomeName
        }
      };
    }
  }
];

export default apis;
