import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service('bitfinex-api'),

  async model() {
    let coinsBitfinexShortable = ['BTC', 'BTG', 'DSH','EOS', 'ETC', 'ETH', 'ETP', 'EUR', 'IOT', 'LTC', 'NEO', 'OMG', 'USD', 'XMR', 'XRP', 'ZEC'];
    let currencyRates = await this.get('ajax').getCurrentFundingRates(coinsBitfinexShortable);
    return { currencyRates };
  }
});
