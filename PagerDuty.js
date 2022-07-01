/*
 * The accompanying program is provided under the terms of the Eclipse Public License 2.0 ("agreement").
 * Written by Rod Anami <rod.anami@kyndryl.com>, June 2022.
*/

const config = require('./Config.js');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const assert = require('assert');

// Internal function - create new https agent
const getHttpsAgent = function(certificate, key, cacert) {

  if(!certificate && !key && cacert) {
    return new https.Agent({
      // CA cert from Hashicorp Vault PKI
      ca: fs.readFileSync(cacert)
    });
  } else {
    return new https.Agent({
      // Client certificate
      cert: fs.readFileSync(certificate),
      key: fs.readFileSync(key),
      // CA cert from Hashicorp Vault PKI
      ca: fs.readFileSync(cacert)
    });
  }
}

// Internal function - creates new axios instance
const getAxiosInstance = function(baseurl, timeout, agent, proxy) {
  return axios.create({
      baseURL: baseurl,
      timeout: timeout,
      headers: {
        'X-Application-Name': config.appName,
        'Accept': config.accept,
        'Content-type': config.contentType
      },
      httpsAgent: agent,
      proxy: proxy
  });
}

// Internal function - parse axios response
const parseAxiosResponse = function(response){
  let message = {};
  if (response.data.auth) {
    message = response.data.auth;
  } else if (response.data.data){
    message = response.data.data;
  } else if (response.data) {
    message = response.data;
  } else {
    message['status']= response.status;
    message['statusText'] = response.statusText;
  }
  return message;
}

// Internal function - parse axios error
const parseAxiosError = function(error){
  let helpMessage = "";
  // Fix the stack
  // passing parseAxiosError as the second param will leave this function out of the trace
  Error.captureStackTrace(error, parseAxiosError);
  // Verify if it's a Vault error
  // https://www.vaultproject.io/api-docs#error-response
  if (error.response && error.response.status) {
    error.isPagerDutyError = true;
    switch(error.response.status){
        case 400:
          helpMessage = "Caller provided invalid arguments. Please review the response for error details. Retrying with the same arguments will not work.";
          break;
        case 401:
          helpMessage = "Caller did not supply credentials or did not provide the correct credentials. If you are using an API key, it may be invalid or your Authorization header may be malformed.";
          break;
        case 402:
          helpMessage = "Account does not have the abilities to perform the action. Please review the response for the required abilities. You can also use the Abilities API to determine what features are available to your account.";
          break;
        case 403:
          helpMessage = "Caller is not authorized to view the requested resource. While your authentication is valid, the authenticated user or token does not have permission to perform this action.";
          break;
        case 429:
          helpMessage = "Too many requests have been made, the rate limit has been reached.";
          break;
        default:
          helpMessage = "Unkown error code or helper is not implemented yet.";
    }
    error.pagerDutyHelpMessage = helpMessage;
  }
  return error;
}

class PagerDuty {
  constructor(params) {
    this.https = params.https || false;
    this.cert = params.cert;
    this.key = params.key;
    this.cacert = params.cacert;
    this.rootPath = params.rootPath;
    this.baseUrl = params.baseUrl || config.restApiUrl;
    this.timeout = params.timeout || config.timeout;
    this.proxy = params.proxy || config.proxy;
    try {
      if (this.https) {
        this.agent = getHttpsAgent(this.cert, this.key, this.cacert);
      }
      else {
        this.agent = false;
      }
      this.instance = getAxiosInstance(this.baseUrl, this.timeout, this.agent, this.proxy);
    } catch (error) {
      console.error('Error initiating PagerDuty class:\n', error);
    }
  }


  /**
  * @param {String<required>} token
  * @returns {Promise<Object>}
  */
  async listAbilities(token){
    const Options = {
      url: config.listAbilities[0],
      method: config.listAbilities[1],
      headers: {
        Authorization: `Token token=${token}`
      }
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      //console.error(err);
      throw parseAxiosError(err);
    }
  }

  /**
  * @param {String<required>} token
  * @param {Object<required>} data
  * @param {String<required>} requesterEmail
  * @returns {Promise<Object>}
  */
  async createUser(token, data, requesterEmail){
    assert(token, 'createUser: required parameter missing - API token');
    assert(data.user, 'createUser: required parameter missing - User object');


    const Options = {
      url: config.createUser[0],
      method: config.createUser[1],
      headers: {
        Authorization: `Token token=${token}`,
        From: `${requesterEmail}`
      },
      data: data
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

  /**
  * @param {String<required>} token
  * @param {String<required>} userId
  * @returns {Promise<Object>}
  */
  async deleteUser(token, userId){
    assert(token, 'deleteUser: required parameter missing - API token');

    const Options = {
      url: `${config.deleteUser[0]}/${userId}`,
      method: config.deleteUser[1],
      headers: {
        Authorization: `Token token=${token}`
      }
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

  /**
  * @param {String<required>} token
  * @param {Object<required>} params
  * @returns {Promise<Object>}
  */
  async listUsers(token, params){
    assert(token, 'listUsers: required parameter missing - API token');

    const { limit, offset, query, total, include, team_ids } = params;

    let queryString = "?";

    if (limit !== undefined) {
      queryString = queryString.concat(`limit=${limit}&`);
    }
    if (offset !== undefined) {
      queryString = queryString.concat(`offset=${offset}&`);
    }
    if (query !== undefined) {
      queryString = queryString.concat(`query=${query}&`);
    }
    if (total !== undefined) {
      queryString = queryString.concat(`total=${total}&`);
    }
    if (include !== undefined) {
      queryString = queryString.concat(`include[]=${include}&`);
    }
    if (team_ids !== undefined) {
      queryString = queryString.concat(`team_ids[]=${team_ids}&`);
    }

    //console.log(queryString);
    const Options = {
      url: `${config.listUsers[0]}${queryString}`,
      method: config.listUsers[1],
      headers: {
        Authorization: `Token token=${token}`
      }
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

  /**
  * @param {String<required>} token
  * @param {Object<required>} params
  * @returns {Promise<Object>}
  */
  async listTeams(token, params){
    assert(token, 'listTeams: required parameter missing - API token');

    const { limit, offset, query, total, include, team_ids } = params;

    let queryString = "?";

    if (limit !== undefined) {
      queryString = queryString.concat(`limit=${limit}&`);
    }
    if (offset !== undefined) {
      queryString = queryString.concat(`offset=${offset}&`);
    }
    if (query !== undefined) {
      queryString = queryString.concat(`query=${query}&`);
    }
    if (total !== undefined) {
      queryString = queryString.concat(`total=${total}&`);
    }

    //console.log(queryString);
    const Options = {
      url: `${config.listTeams[0]}${queryString}`,
      method: config.listTeams[1],
      headers: {
        Authorization: `Token token=${token}`
      }
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

/// Events API

  /**
  * @param {String<required>} integrationKey
  * @param {Object<required>} data
  * @returns {Promise<Object>}
  */
  async triggerEventAlert(integrationKey, data){
    assert(integrationKey, 'triggerEventAlert: required parameter missing - API Integration key');

    let rootPath = "";
    if (this.rootPath) {
      rootPath = this.rootPath;
    } else {
      rootPath = config.alertRootPath;
    }
    data.routing_key = integrationKey;
    //console.log(queryString);
    const Options = {
      url: `${rootPath}`,
      method: config.eventAPIMethod,
      data: data
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

  /**
  * @param {String<required>} integrationKey
  * @param {String<required>} deduplicationKey
  * @param {Object<required>} data
  * @returns {Promise<Object>}
  */
  async acknowledgeEventAlert(integrationKey, deduplicationKey, data){
    assert(integrationKey, 'acknowledgeEventAlert: required parameter missing - API Integration key');
    assert(deduplicationKey, 'acknowledgeEventAlert: required parameter missing - Event Alert deduplication key');

    let rootPath = "";
    if (this.rootPath) {
      rootPath = this.rootPath;
    } else {
      rootPath = config.alertRootPath;
    }
    data.routing_key = integrationKey;
    data.dedup_key = deduplicationKey;
    data.event_action = 'acknowledge';
    //console.log(queryString);
    const Options = {
      url: `${rootPath}`,
      method: config.eventAPIMethod,
      data: data
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

  /**
  * @param {String<required>} integrationKey
  * @param {String<required>} deduplicationKey
  * @param {Object<required>} data
  * @returns {Promise<Object>}
  */
  async resolveEventAlert(integrationKey, deduplicationKey, data){
    assert(integrationKey, 'acknowledgeEventAlert: required parameter missing - API Integration key');
    assert(deduplicationKey, 'acknowledgeEventAlert: required parameter missing - Event Alert deduplication key');

    let rootPath = "";
    if (this.rootPath) {
      rootPath = this.rootPath;
    } else {
      rootPath = config.alertRootPath;
    }
    data.routing_key = integrationKey;
    data.dedup_key = deduplicationKey;
    data.event_action = 'resolve';
    //console.log(queryString);
    const Options = {
      url: `${rootPath}`,
      method: config.eventAPIMethod,
      data: data
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

  /**
  * @param {String<required>} integrationKey
  * @param {Object<required>} data
  * @returns {Promise<Object>}
  */
  async sendChangeEvent(integrationKey, data){
    assert(integrationKey, 'acknowledgeEventAlert: required parameter missing - API Integration key');

    let rootPath = "";
    if (this.rootPath) {
      rootPath = this.rootPath;
    } else {
      rootPath = config.changeRootPath;
    }
    data.routing_key = integrationKey;
    //console.log(queryString);
    const Options = {
      url: `${rootPath}`,
      method: config.eventAPIMethod,
      data: data
    };

    try {
      const response = await this.instance(Options);
      return parseAxiosResponse(response);
    } catch(err) {
      console.error(err.response.data);
      throw parseAxiosError(err);
    }
  }

};

module.exports = PagerDuty;
