const PagerDuty = require('../PagerDuty');

const ClientCert = process.env.CLIENT_CERT;
const ClientKey = process.env.CLIENT_KEY;
const CACert = process.env.CA_CERT;
const PDUrl = process.env.PD_API_REST_URL;
const PDApiToken = process.env.PD_API_TOKEN;

const Params = {
    limit: 10,
    offset: 0,
    total: true
}

const pd = new PagerDuty({
    https: true,
    cert: ClientCert,
    key: ClientKey,
    cacert: CACert,
    baseUrl: PDUrl,
    timeout: 3000,
    proxy: false
});

;

let userId = null;

//TODO: Improve expected data assertion on all tests

test('the result is a list of existing teams', async () => {
    const data = await pd.listTeams(PDApiToken, Params);
    console.log(data);
	return expect(data).toBeDefined();
});
