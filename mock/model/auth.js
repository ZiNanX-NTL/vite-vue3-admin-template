// export const userModel = [
//   {
//     token: '__TOKEN_SOYBEAN__',
//     refreshToken: '__REFRESH_TOKEN_SOYBEAN__',
//     userId: '0',
//     userName: 'Soybean',
//     userRole: 'super',
//     password: 'soybean123'
//   },
//   {
//     token: '__TOKEN_SUPER__',
//     refreshToken: '__REFRESH_TOKEN_SUPER__',
//     userId: '1',
//     userName: 'Super',
//     userRole: 'super',
//     password: 'super123'
//   },
//   {
//     token: '__TOKEN_ADMIN__',
//     refreshToken: '__REFRESH_TOKEN_ADMIN__',
//     userId: '2',
//     userName: 'Admin',
//     userRole: 'admin',
//     password: 'admin123'
//   },
//   {
//     token: '__TOKEN_USER01__',
//     refreshToken: '__REFRESH_TOKEN_USER01__',
//     userId: '3',
//     userName: 'User01',
//     userRole: 'user',
//     password: 'user01123'
//   }
// ];
export const userModel = [
  {
    token: '__TOKEN_SOYBEAN__',
    refreshToken: '__REFRESH_TOKEN_SOYBEAN__',
    userId: '0',
    userName: 'Soybean',
    userRole: ['super'],
    userPermissions: ['B_CODE1', 'B_CODE2', 'B_CODE3'],
    password: 'soybean123'
  },
  {
    token: '__TOKEN_SUPER__',
    refreshToken: '__REFRESH_TOKEN_SUPER__',
    userId: '1',
    userName: 'Super',
    userRole: ['super'],
    userPermissions: ['B_CODE1', 'B_CODE2', 'B_CODE3'],
    password: 'super123'
  },
  {
    token: '__TOKEN_ADMIN__',
    refreshToken: '__REFRESH_TOKEN_ADMIN__',
    userId: '2',
    userName: 'Admin',
    userRole: ['admin'],
    userPermissions: ['B_CODE2', 'B_CODE3'],
    password: 'admin123'
  },
  {
    token: '__TOKEN_USER01__',
    refreshToken: '__REFRESH_TOKEN_USER01__',
    userId: '3',
    userName: 'User01',
    userRole: ['user'],
    userPermissions: ['B_CODE3'],
    password: 'user01123'
  }
];
