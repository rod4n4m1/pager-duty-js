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

//TODO: Improve expected data assertion on all tests

test('the result is a list of API abilities based on the given token', async () => {
    const data = await pd.listAbilities(PDApiToken);
    console.log(data);
	return expect(data).toBeDefined();
});
