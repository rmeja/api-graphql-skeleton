module.exports = {
  can: (permission) => {
    return (root, args, { request }) => {
      if (request.baseUrl === '/graphql-test') return Promise.resolve();
      return request.user.hasPermissionTo(permission).then((isPermitted) => {
        return (isPermitted) ? Promise.resolve() : Promise.reject(new Error('access denied'));
      });
    };
  }
};
