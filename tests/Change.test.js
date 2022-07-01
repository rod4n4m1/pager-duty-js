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
const BuildStates = ['passed', 'failed', 'warning', 'error'];
const BuildState = BuildStates[Math.floor(Math.random()*BuildStates.length)];

const pd = new PagerDuty({
    https: true,
    cert: ClientCert,
    key: ClientKey,
    cacert: CACert,
    baseUrl: PDUrl,
    rootPath: 'change/enqueue',
    timeout: 3000,
    proxy: false
});

const ChangeData = {
  payload: {
    summary: `(TEST) change on ${HostName}-${HostNumber}.example.com`,
    timestamp: TimeStamp,
    source: "pager-duty-js jest",
    custom_details: {
      build_state: BuildState,
      build_number: '220',
      run_time: '1234s'
    }
  },
  images: [
    {
      src: 'https://chart.googleapis.com/chart?chs=600x400&chd=t:6,2,9,5,2,5,7,4,8,2,1&cht=lc&chds=a&chxt=y&chm=D,0033FF,0,0,5,1',
      href: 'https://google.com',
      alt: 'An example link with an image'
    }
  ],
  links: [
    {
      href: 'https://example.com/devops/pipeline/builds/220',
      text: 'View in Build Pipeline'
    }
  ]
};




//TODO: Improve expected data assertion on all tests

test('the result is a new change event', async () => {
    const data = await pd.sendChangeEvent(PDApiToken, ChangeData);
    console.log(data);
	return expect(data).toBeDefined();
});
