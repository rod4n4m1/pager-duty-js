const config = {
  appName: 'pager-duty-js',
  restApiUrl: 'https://api.pagerduty.com',
  eventApiUrl: 'https://events.pagerduty.com/v2',
  eventAPIMethod: 'post',
  alertRootPath: 'enqueue',
  changeRootPath: 'change/enqueue',
  timeout: 1000,
  proxy: false,
  accept: 'application/vnd.pagerduty+json;version=2',
  contentType: 'application/json',
  listAbilities: [ 'abilities', 'get'],
  createUser: [ 'users', 'post'],
  deleteUser: [ 'users', 'delete'],
  listUsers: ['users', 'get'],
  listTeams: ['teams', 'get']
};

module.exports = config;
