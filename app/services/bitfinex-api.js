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
        if (w[1] == "USD") {
          val = Math.round(val);
        }
        return { currency: w[1], amount: val };
      });
    }).catch(() => {
      return [{ currency: "ERR" }];
    });
  },

  getFreeFunding(currency, precision = 0) {
    const apiPath = 'v2/auth/calc/order/avail';

    let currencySymbol = `f${currency}`;
    const data = {
      symbol: currencySymbol,
      type: 'FUNDING'
    };
    return this.getAuthenticatedInfo(apiPath, data).then(response => {
      let amount = Math.abs(response.response[0]);
      return amount.toFixed(precision);
    }).catch(() => {
      return 'ERR';
    });
  },

  getActiveFundingOrders(currency) {
    const apiPath = `v2/auth/r/funding/offers/f${currency}`;

    return this.getAuthenticatedInfo(apiPath, {}).then(response => {
      let openOffers = '';
      for (let offerInfo of response.response) {
        openOffers = openOffers + `${offerInfo[4]} ${currency} status: ${offerInfo[10]} ; `;
      }
      if (openOffers == '') {
        openOffers = 'none';
      }
     return openOffers;

    }).catch(() => {
      return 'ERR';
    });
  }
});
