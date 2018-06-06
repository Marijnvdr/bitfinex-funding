import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';


export default Route.extend({
  ajax: service('bitfinex-api'),

  async model() {
    let wallets = await this.get('ajax').getFundingWallets();
    for (let wallet of wallets) {
      wallet.amountFree = await this.get('ajax').getFreeFunding(wallet.currency);
      wallet.openOrders = await this.get('ajax').getActiveFundingOrders(wallet.currency);
    }

    return hash({
      fundingWallets: wallets
    });
  }
});
