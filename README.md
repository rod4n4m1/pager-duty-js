# PagerDuty JS
![GitHub issues](https://img.shields.io/github/issues/rod4n4m1/pager-duty-js)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/rod4n4m1/pager-duty-js)
![GitHub repo file count](https://img.shields.io/github/directory-file-count/rod4n4m1/pager-duty-js)
![GitHub top language](https://img.shields.io/github/languages/top/rod4n4m1/pager-duty-js)
![GitHub contributors](https://img.shields.io/github/contributors/rod4n4m1/pager-duty-js)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/rod4n4m1/pager-duty-js/axios)
![npm](https://img.shields.io/npm/dm/pager-duty-js)
![NPM](https://img.shields.io/npm/l/pager-duty-js)

This module provides a set of functions to help **JavaScript** Developers working with PagerDuty to authenticate and access API endpoints using **JavaScript** _promises_.


## Requirements (MacOS/Windows)

* NodeJs
  * Minimum: v14.x
  * Recommended: **v16.x**  
* npm
  * Tested on: **v8.12.x**
* PagerDuty API
  * REST API **v2**
  * Events API **v2**

**Note:** Depending on your Windows setup [windows-build-tools](https://www.npmjs.com/package/windows-build-tools) may need to be installed first. Also, for MacOS users, you should have **xcode-select** or entire Xcode App installed.

### Install

`npm install pager-duty-js --save`

### Uninstall

`npm uninstall pager-duty-js`

### Release notes and versions

[Change log](./CHANGELOG.md)

### Class Constructor

```javascript
{
  // Indicates if the HTTP request to the PagerDuty API server should use
  // HTTPS (secure) or HTTP (non-secure) protocol
  https: true,
  // If https is true, then provide client certificate, client key and
  // the root CA cert (PagerDuty API uses DigiCert one)
  // Client cert and key are optional now
  cert: './client.crt',
  key: './client.key',
  cacert: './ca.crt',
  // Indicate the PagerDuty API URL,
  // all paths are relative to this one
  baseUrl: 'https://api.pagerduty.com',
  // HTTP request timeout in milliseconds
  timeout: 1000,
  // If should use a proxy or not by the HTTP request
  // Example:
  // proxy: { host: proxy.ip, port: proxy.port }
  proxy: false
}
```

## Module usage

**Note:** This package covers some auth methods and secret engines. Check `Coverage and Limitations` section for more details.


### Rest API

* PagerDuty API [reference](https://developer.pagerduty.com/api-reference)

**Production**

```javascript
const PagerDuty = require('pager-duty-js');

const pd = new PagerDuty( {
    https: true,
    cert: './client.crt',
    key: './client.key',
    cacert: './digicert-ca.crt',
    baseUrl: 'https://api.pagerduty.com',
    timeout: 1000,
    proxy: false
});
```

**Development**

```javascript
const PagerDuty = require('pager-duty-js');

const pd = new PagerDuty( {
    https: true,
    baseUrl: 'https://api.pagerduty.com',
    timeout: 3000,
    proxy: false
});
```

### Events API

**Alerts**

```javascript
const PagerDuty = require('pager-duty-js');

const pd = new PagerDuty( {
    https: true,
    cert: './client.crt',
    key: './client.key',
    cacert: './digicert-ca.crt',
    baseUrl: 'https://events.pagerduty.com/v2',
    rootPath: 'enqueue',
    timeout: 1000,
    proxy: false
});
```

**Change**

```javascript
const PagerDuty = require('pager-duty-js');

const pd = new PagerDuty( {
    https: true,
    cert: './client.crt',
    key: './client.key',
    cacert: './digicert-ca.crt',
    baseUrl: 'https://events.pagerduty.com/v2',
    rootPath: 'change/enqueue',
    timeout: 1000,
    proxy: false
});
```

### Code Sniplets

* Check abilities for a given Rest API Token:

```javascript
const status = await pd.listAbilities(token);
```

* Create a new user through the Rest API:

```javascript
const status = await pd.createUser(token, data, requesterEmail);
```

* List alls teams through the Rest API:

```javascript
const status = await pd.listTeams(token, params);
```

* Trigger an alert through the Events API:

```javascript
const status = await pd.triggerEventAlert(integrationKey, data);
```


## Error handling

This package extends the error stack to differentiate if the exception occurred on the PagerDuty API layer or not. Also, adds a help message from the PagerDuty API docs.

```javascript
try {
  pd.function(...);
}
// An exception happened and it was thrown
catch(err) {
  if(err.isPagerDutyError) {
    // This an error from PagerDuty API
    // Check PagerDuty hint on this error
    console.log(err.pagerDutyHelpMessage);
  }
  else {
    // Here is still the full Axios error, e.g. err.isAxiosError, err.response, err.request
    // This allows handling of network/tls related issues
    // Or just re-throw if you don't care
    throw err;
  }
}
```

Check below docs for more information on specific function groups.

## List of available functions

### Rest API

| **Group** | **Link** |
|:---------------------------------------|:--------------:|
| Abilities | [Doc](./docs/Abilities.md) |
| Teams | [Doc](./docs/Teams.md) |
| Users | [Doc](./docs/Users.md) |
|  |  |

### Events API

| **Group** | **Link** |
|:---------------------------------------|:--------------:|
| Alert | [Doc](./docs/Alert.md) |
| Change | [Doc](./docs/Change.md) |
|  |  |


## Coverage and Limitations

### API rate limiting

* Check the PagerDuty API rate limits [here](https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTUz-rate-limiting)

### Rest API Coverage

The following PagerDuty API groups are currently covered:

* Abilities (Partially)
* Teams (Partially)
* Users (Partially)

### Events API Coverage

* Alert (Full)
  * trigger
  * acknowledge
  * resolve
* Change (Full)
  * send


### Creating your developer account on PagerDuty
Follow the detailed instructions from this [site](https://developer.pagerduty.com/)

### Contributing
If you want to contribute to the module and make it better, your help is very welcome. You can do so submitting a **Pull Request**. It will be reviewed and merged to main branch if accepted.

### Reporting an issue
If you have found what you believe to be an issue with `pager-duty-js` please do not hesitate to file an issue on the GitHub repository [here](https://github.com/rod4n4m1/pager-duty-js/issues/new?template=bug-report.md).

### Suggesting a new feature
If you want to see new features or enhancements to the current ones, we would love to hear them. Please submit an issue on the GitHub repository [here](https://github.com/rod4n4m1/pager-duty-js/issues/new?template=new-feature.md).

### Authors
Written by Rod Anami <rod.anami@kyndryl.com>, June 2022.

### Contributors
* None

### License
This project is licensed under the [Eclipse Public License 2.0](https://opensource.org/licenses/EPL-2.0).

PagerDuty API usage follows the [PagerDuty Developer Agreement](https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTg0-pager-duty-developer-agreement).
