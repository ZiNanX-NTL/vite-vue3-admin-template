import { mock } from 'mockjs';

const data = mock({
  'list|1000': [
    {
      id: '@id',
      userName: '@cname',
      'age|18-56': 56,
      'gender|1': ['1', '2', null],
      phone:
        /^[1](([3][0-9])|([4][01456789])|([5][012356789])|([6][2567])|([7][0-8])|([8][0-9])|([9][012356789]))[0-9]{8}$/,
      'email|1': ['@email("qq.com")', null],
      'userStatus|1': ['1', '2', '3', '4', null]
    }
  ]
});

const apis = [
  {
    url: '/mock/userList',
    method: 'post',
    response: option => {
      const { page, pageSize } = option.body;

      // 接口接收分页参数,根据参数返回分页列表数据
      const total = data.list.length;
      const start = (page - 1) * pageSize;
      const end = page * pageSize;
      const list = data.list.slice(start, end);

      return {
        code: 200,
        message: 'ok',
        data: {
          records: list,
          current: page,
          size: pageSize,
          total
        }
      };
    }
  },
  {
    url: '/mock/allUserList',
    method: 'get',
    response: () => {
      // 接口接收分页参数,根据参数返回分页列表数据
      const total = data.list.length;

      return {
        code: 200,
        message: 'ok',
        data: {
          records: data.list,
          total
        }
      };
    }
  }
];

export default apis;
