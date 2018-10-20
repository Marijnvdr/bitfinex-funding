import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service('bitfinex-api'),

  async model() {
    let coinsBitfinexShortable = this.get('ajax').getCoinsBitfinexShortable();
    let currencyRates = await this.get('ajax').getCurrentFundingRates(coinsBitfinexShortable);
    return { currencyRates };
  }
});
