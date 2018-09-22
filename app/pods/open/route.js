import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';


export default Route.extend({
  ajax: service('bitfinex-api'),

  async model() {
    let offers = await this.get('ajax').getActiveFundingOrders();
    return { offers };
  }
});
