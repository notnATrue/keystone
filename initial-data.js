// const crypto = require('crypto');
// const randomString = () => crypto.randomBytes(6).hexSlice();

// module.exports = async keystone => {

//   // const {
//   //   data
//   // } = await keystone.executeGraphQL({
//   //   context: keystone.createContext({ skipAccessControl: true }),
//   //   query: `query {
//   //     Todo {
//   //       name
//   //     }
//   //   }`,
//   // });

//   // console.log(data)

//   // Count existing users
//   const {
//     data: {
//       _allUsersMeta: { count = 0 },
//     },
//   } = await keystone.executeGraphQL({
//     context: keystone.createContext({ skipAccessControl: true }),
//     query: `query {
//       _allUsersMeta {
//         count
//       }
//     }`,
//   });

//   if (count === 0) {
//     const password = "keystoneroot";
//     const email = 'admin@example.com';

//     const { errors } = await keystone.executeGraphQL({
//       context: keystone.createContext({ skipAccessControl: true }),
//       query: `mutation initialUser($password: String, $email: String) {
//             createUser(data: {name: "Admin", email: $email, isAdmin: true, password: $password}) {
//               id
//             }
//           }`,
//       variables: { password, email },
//     });

//     if (errors) {
//       console.log('failed to create initial user:');
//       console.log(errors);
//     } else {
//       console.log(`

//       User created:
//         email: ${email}
//         password: ${password}
//       Please change these details after initial login.
//       `);
//     }
//   }
// };
