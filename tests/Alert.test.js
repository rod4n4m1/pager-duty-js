const PagerDuty = require('../PagerDuty');
const randomWords = require('random-words');

const ClientCert = process.env.CLIENT_CERT;
const ClientKey = process.env.CLIENT_KEY;
const CACert = process.env.CA_CERT;
const PDUrl = process.env.PD_API_EVENTS_URL;
const PDApiToken = process.env.PD_API_INTEGRATION_KEY;
const TodayDate = new Date();
const TimeStamp = TodayDate.toISOString();
const HostNumber = Math.floor((Math.random() * 100) + 1);
const HostName = randomWords({ exactly: 1, wordsPerString: 2, separator:'-' });
const Severities = ['critical', 'error', 'warning', 'info'];
const Severity = Severities[Math.floor(Math.random()*Severities.length)];

const pd = new PagerDuty({
    https: true,
    cert: ClientCert,
    key: ClientKey,
    cacert: CACert,
    baseUrl: PDUrl,
    rootPath: 'enqueue',
    timeout: 3000,
    proxy: false
});

const AlertData = {
  payload: {
    summary: `(TEST) alert on ${HostName}-${HostNumber}.example.com`,
    timestamp: TimeStamp,
    source: "pager-duty-js jest",
    severity: Severity,
    component: "middleware",
    group: "prod-frontend",
    class: "reliability",
    custom_details: {
      "ping time": "1500ms",
      "load avg": 0.75
    }
  },
  images: [
    {
      "src": "https://www.pagerduty.com/wp-content/uploads/2016/05/pagerduty-logo-green.png",
      "href": "https://example.com/",
      "alt": "Example text"
    }
  ],
  links: [
    {
      "href": "https://example.com/",
      "text": "Link text"
    }
  ],
  event_action: "trigger",
  client: "pager-duty-js jest",
  client_url: "https://monitoring.example.com"
};

const RequiredData = {
  payload: {
    summary: `(TEST) alert on ${HostName}-${HostNumber}.example.com`,
    source: "pager-duty-js jest",
    severity: Severity
  }
};

let dedupKey = "";


//TODO: Improve expected data assertion on all tests

test('the result is a new alert triggered', async () => {
    const data = await pd.triggerEventAlert(PDApiToken, AlertData);
    console.log(data);
    dedupKey = data.dedup_key;
	return expect(data).toBeDefined();
});

test('the result is the previous alert gets acknowledged', async () => {
    const data = await pd.acknowledgeEventAlert(PDApiToken, dedupKey, RequiredData);
    console.log(data);
	return expect(data).toBeDefined();
});

test('the result is the previous alert get resolved', async () => {
    const data = await pd.resolveEventAlert(PDApiToken, dedupKey, RequiredData);
    console.log(data);
	return expect(data).toBeDefined();
});
