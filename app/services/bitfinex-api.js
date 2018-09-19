import AjaxService from 'ember-ajax/services/ajax';
import Crypto from 'npm:crypto';

const apiKey = 'UiDHpO1RvOhpFMiOymGFKOpPJfXzhRpJKqjVZd1CQSA';
const apiSecret = 'qH0gYkTfIRmSiqe3oR6kBkKAKXXsrhhucKBjcVNRaHT';

export default AjaxService.extend({
  host: 'https://api.bitfinex.com',

  getAuthenticatedInfo(apiPath, data) {
    const rawBody = JSON.stringify(data);

    const nonce = Date.now().toString();

    let payload = `/api/${apiPath}${nonce}${rawBody}`;

    let signature = Crypto
      .createHmac('sha384', apiSecret)
      .update(payload)
      .digest('hex');

     return this.raw(`/${apiPath}`, {
      method: 'POST',
      headers: {
        'bfx-nonce': nonce,
        'bfx-apikey': apiKey,
        'bfx-signature': signature,
        'content-type': 'application/json'
      },
      data: data
    });
  },

  getFundingWallets() {
    const apiPath = 'v2/auth/r/wallets';

    return this.getAuthenticatedInfo(apiPath, {}).then(response => {
      let rawWallets = response.response.filter((w) => w[0] == "funding");
      return rawWallets.map((w) => {
        let val = w[2];
        if (w[1] == "USD" || w[1] == "EUR") {
          val = Math.round(val);
        } else {
          val = val.toFixed(6);
        }
        return { currency: w[1], amount: val };
      });
    }).catch(() => {
      return [{ currency: "ERR" }];
    });
  },

  getSuppliedFunding() {
    const apiPath = 'v2/auth/r/funding/credits';

    return this.getAuthenticatedInfo(apiPath, {}).then(response => {
      let funded = [];
      let coinsBitfinexShortable = ['BTC', 'BTG', 'DSH','EOS', 'ETC', 'ETH', 'ETP', 'EUR', 'IOT', 'LTC', 'NEO', 'OMG', 'SAN', 'USD', 'XMR', 'XRP', 'ZEC'];
      for (let coin of coinsBitfinexShortable) {
        funded.push(this.getSuppliedForCurrency(coin, response.response, 1));
      }
     return funded;
    }).catch(() => {
      return ['ERR'];
    });
    },

    getSuppliedMargin() {
      const apiPath = 'v2/auth/r/funding/credits';

      return this.getAuthenticatedInfo(apiPath, {}).then(response => {
        let funded = [];
        let coinsBitfinexShortable = ['BTC', 'BTG', 'DSH','EOS', 'ETC', 'ETH', 'ETP', 'EUR', 'IOT', 'LTC', 'NEO', 'OMG', 'SAN', 'USD', 'XMR', 'XRP', 'ZEC'];
        for (let coin of coinsBitfinexShortable) {
          funded.push(this.getSuppliedForCurrency(coin, response.response, -1));
        }
       return funded;
      }).catch(() => {
        return ['ERR'];
      });
      },

  // parameter fundingOrMargin: 1 means funding, -1 means margin
  getSuppliedForCurrency(currency, fundings, fundingOrMargin) {
    let totalAmount = 0;
    let totalWeightedAverageRate = 0;
    for (let offerInfo of fundings) {
      if (offerInfo[1] == `f${currency}` && offerInfo[2] == fundingOrMargin && offerInfo[7] == "ACTIVE" ) {
        let amount = offerInfo[5];
        let rate = offerInfo[11] * 100;
        totalAmount += amount;
        totalWeightedAverageRate += (amount * rate);
      }
    }
    let info = '';
    if (totalWeightedAverageRate > 0) {
      let averageRate = totalWeightedAverageRate / totalAmount;
      if (currency == "USD" || currency == "EUR") {
        totalAmount = Math.round(totalAmount);
      } else {
        totalAmount = totalAmount.toFixed(2);
      }
      let yearRate = averageRate * 365;
      info = `${totalAmount} ${currency} at ${averageRate.toFixed(4)}% (${yearRate.toFixed(1)}%)`;
    }
    return info;
  },

  getFreeFunding(currency) {
    const apiPath = 'v2/auth/calc/order/avail';

    let currencySymbol = `f${currency}`;
    const data = {
      symbol: currencySymbol,
      type: 'FUNDING'
    };
    return this.getAuthenticatedInfo(apiPath, data).then(response => {
      let amount = Math.abs(response.response[0]);
      if (currency == "USD" || currency == "EUR") {
        return amount.toFixed(0);
      } else {
        return amount.toFixed(2);
      }
    }).catch(() => {
      return 'ERR';
    });
  },

  getActiveFundingOrders(currency) {
    const apiPath = `v2/auth/r/funding/offers/f${currency}`;

    return this.getAuthenticatedInfo(apiPath, {}).then(response => {
      let openOffers = '';
      for (let offerInfo of response.response) {
        let rate = offerInfo[14] * 100;
        openOffers = openOffers + `${offerInfo[4]} ${currency} at rate ${rate}% with status: ${offerInfo[10]} ; `;
      }
      if (openOffers == '') {
        openOffers = 'none';
      }
     return openOffers;

    }).catch(() => {
      return 'ERR';
    });
  },

  getCurrentFundingRates(currencies) {
    let mappedCurrencies = currencies.map((c) => {
      return `f${c.toUpperCase()}`;
    });
    let querystring = mappedCurrencies.join();
    return this.request(`v2/tickers?symbols=${querystring}`).then((response) => {
      let rates = [];
      for (let currencyRate of response) {
        let ask = currencyRate[5] * 100;
        let last = currencyRate[10] * 100;
        rates.push({ currency: currencyRate[0].substr(1), ask: ask.toFixed(4), last: last.toFixed(4) });
      }
      return rates;
    });
  }
});
