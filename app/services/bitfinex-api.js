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
    });
  }
});
