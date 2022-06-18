# PagerDuty JS

## Events API

### Alert

* triggerEventAlert(integrationKey, data)

```javascript
/**
* @param {String<required>} integrationKey
* @param {Object<required>} data
* @returns {Promise<Object>}
*/
```

* acknowledgeEventAlert(integrationKey, deduplicationKey, data)

```javascript
/**
* @param {String<required>} integrationKey
* @param {String<required>} deduplicationKey
* @param {Object<required>} data
* @returns {Promise<Object>}
*/
```

* resolveEventAlert(integrationKey, deduplicationKey, data)

```javascript
/**
* @param {String<required>} integrationKey
* @param {String<required>} deduplicationKey
* @param {Object<required>} data
* @returns {Promise<Object>}
*/
```
