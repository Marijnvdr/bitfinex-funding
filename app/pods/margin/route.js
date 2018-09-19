import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service('bitfinex-api'),

  async model() {
    let taken = await this.get('ajax').getSuppliedMargin();
    return { takenCurrencies: taken };
  }
});
