import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';


export default Route.extend({
  ajax: service('bitfinex-api'),

  model() {
    return hash({
      amountUsd: this.get('ajax').getFreeFunding('USD'),
      amountZec: this.get('ajax').getFreeFunding('ZEC', 2)
    });
  }
});
