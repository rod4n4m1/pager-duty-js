const PagerDuty = require('../PagerDuty');

const ClientCert = process.env.CLIENT_CERT;
const ClientKey = process.env.CLIENT_KEY;
const CACert = process.env.CA_CERT;
const PDUrl = process.env.PD_API_REST_URL;
const PDApiToken = process.env.PD_API_TOKEN;

const pd = new PagerDuty( {
    https: true,
    cert: ClientCert,
    key: ClientKey,
    cacert: CACert,
    baseUrl: PDUrl,
    timeout: 3000,
    proxy: false
});

const listAbilities = function(token) {
  pd.listAbilities(token).then(function(result){
    console.log(result);
    return result;
  }).catch(function(error){
    console.error(error);
    return error;
  });
};

listAbilities(PDApiToken);
