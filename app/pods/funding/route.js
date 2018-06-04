import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';


export default Route.extend({
  ajax: service('bitfinex-api'),

  model() {
    return hash({
      fundingWallets: this.get('ajax').getFundingWallets(),
      amountUsd: this.get('ajax').getFreeFunding('USD'),
      amountZec: this.get('ajax').getFreeFunding('ZEC', 2),
      openOffersZec: this.get('ajax').getActiveFundingOrders('ZEC'),
      openOffersUsd: this.get('ajax').getActiveFundingOrders('USD')
    });
  }
});
