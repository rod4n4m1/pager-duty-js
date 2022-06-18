const PagerDuty = require('../PagerDuty');

const ClientCert = process.env.CLIENT_CERT;
const ClientKey = process.env.CLIENT_KEY;
const CACert = process.env.CA_CERT;
const PDUrl = process.env.PD_API_REST_URL;
const PDApiToken = process.env.PD_API_TOKEN;
const PDRequesterEmail = process.env.PD_REQUESTER_EMAIL;

const Data = {
  user: {
    type: "user",
    name: "John Smith",
    email: "john.smith@example.com",
    time_zone: "America/Sao_Paulo",
    color: "green",
    role: "admin",
    job_title: "Engineering Director",
    description: "The boss",
    avatar_url: "http://www.gravatar.com/avatar/?d=identicon"
  }
};

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


test('the result is a new user created', async () => {
    const data = await pd.createUser(PDApiToken, Data, PDRequesterEmail);
    console.log(data);
    userId = data.user.id;
	return expect(data).toBeDefined();
});


test('the result is a list of existing users', async () => {
    const data = await pd.listUsers(PDApiToken, Params);
    console.log(data);
	return expect(data).toBeDefined();
});


test('the result is previous user deleted', async () => {
    const data = await pd.deleteUser(PDApiToken, userId);
    console.log(data);
	return expect(data).toBeDefined();
});
