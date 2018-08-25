const rp = require('request-promise');
const request = require('request');
const { clientId } = require('../config/environment');
const { clientSecret } = require('../config/environment');
const { redirectUri } = require('../config/environment');
// const today = new Date;
// const date = today.toLocaleString().slice(0,2);
// const month = today.toLocaleString().slice(3,5);
// const year = today.toLocaleString().slice(6,10);
const date = (new Date()).toISOString().slice(0,10);
// const today = (new Date()).toISOString().slice(0,10)+'T00:00:00Z';
const today = '2018-08-23T00:00:00Z';

const oauthDetails = {
  // clientId: 'oauth2client_00009ZwDIYexsmCFEpJO09',
  // clientSecret: 'mnzpub.nLYRcNz2lKr9XsltNdJXbUygVSci/He9xp3REApCNyfGwPaqNoVQdJN/Z/KMRXlBxip7dSUFcQaZrjkzYWYH',
  // redirectUri: 'http://localhost:4000/api/oauth/callback'
  clientId,
  clientSecret,
  redirectUri
};

let accessToken = null;
let transactionsData = [];


function login(req, res) {
  const { clientId, redirectUri } = oauthDetails;
  // const monzoAuthUrl = 'https://auth.monzo.com';
  // const qs = req.query;

  res.redirect(`https://auth.monzo.com/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`);
}

function callback(req, res) {

  const { clientId, clientSecret, redirectUri } = oauthDetails;
  const { code } = req.query;
  const monzoAuthUrl = 'https://api.monzo.com/oauth2/token';

  // Initiate request to retrieve access token
  request.post({
    url: monzoAuthUrl,
    form: {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code
    }
  }, (err, response, body) => {
    accessToken = JSON.parse(body); // Populate access_token variable with token response
    console.log('callback access token is ===>', accessToken);
    res.type('html');
    res.status(200);
    res.send(`<p>HELLO WORLD!</p>`);

    // res.redirect('https://thriftyapp.herokuapp.com/#!/users/5b7b0e7b8e801f00331e1f0e')
    // res.redirect('/api/transactions'); // Send user to their accounts
  });

}

function accounts(req, res) {
  console.log('accounts access token is ===>', accessToken);

  const { token_type, access_token } = accessToken;
  const accountsUrl = 'https://api.monzo.com/accounts?account_type=uk_retail';

  request.get(accountsUrl, {
    headers: {
      Authorization: `${token_type} ${access_token}`
    }
  }, (req, response, body) => {
    const { accounts } = JSON.parse(body);
    // console.log('body is', body);
    console.log('accounts is =======>', accounts);
    console.log('account id is ===>', accounts[0].id);
  });

}

function transactions(req, res) {
  console.log('today looks like', today);
  const { token_type, access_token } = accessToken;
  const transactionsUrl = `https://api.monzo.com/transactions?expand[]=merchant&account_id=acc_00009OPnV5jnOw9VsS0oKX&since=${today}&limit=100`;

  request.get(transactionsUrl, {
    headers: {
      Authorization: `${token_type} ${access_token}`
    }
  }, (req, response, body) => {
    const { transactions } = JSON.parse(body);
    // console.log('transactions is =======>', transactions);
    // transactionsData = transactions;
    res.json(transactions);

  });
}

function balance(req, res) {
  const qs = req.query;
  const { token_type, access_token } = accessToken;
  // const potsUrl = `https://api.monzo.com/pots/pot_00009UpCmbImvocgZL3UoL/deposit`;

  rp({
    method: 'GET',
    url: `https://api.monzo.com/balance?account_id=acc_00009OPnV5jnOw9VsS0oKX`,
    headers: {
      Authorization: `${token_type} ${access_token}`
    }
  }, (req, response, body) => {
    console.log('res is', res);
    const { balance } = JSON.parse(body);
    console.log('balance is =======>', balance);
    // transactionsData = transactions;
    res.json(balance);

  });
}

function pots(req, res) {
  const { token_type, access_token } = accessToken;
  const potsUrl = `https://api.monzo.com/pots`;

  request.get(potsUrl, {
    headers: {
      Authorization: `${token_type} ${access_token}`
    }
  }, (req, response, body) => {
    const { pots } = JSON.parse(body);
    // console.log('pots is =======>', pots);
    // transactionsData = transactions;
    res.json(pots);

  });
}

function moveSavings(req, res) {
  const qs = req.query;
  const { token_type, access_token } = accessToken;
  // const potsUrl = `https://api.monzo.com/pots/pot_00009UpCmbImvocgZL3UoL/deposit`;

  rp({
    method: 'PUT',
    url: `https://api.monzo.com/pots/${qs.id}/deposit`,
    headers: {
      Authorization: `${token_type} ${access_token}`
    },
    form: {
      source_account_id: 'acc_00009OPnV5jnOw9VsS0oKX',
      amount: qs.amount,
      dedupe_id: Math.random()
    }
  }, (req, response, body) => {
    console.log('res is', res);
    const { responsefromMonzo } = JSON.parse(body);
    console.log('response is =======>', responsefromMonzo);
    // transactionsData = transactions;
    res.json(responsefromMonzo);

  });
}


module.exports = {
  login,
  callback,
  accounts,
  transactions,
  pots,
  moveSavings,
  balance
};
