import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';


export default Route.extend({
  ajax: service('bitfinex-api'),

  async model() {
    let wallets = await this.get('ajax').getFundingWallets();
    let currencies = [];
    for (let wallet of wallets) {
      currencies.push(wallet.currency);
      wallet.amountFree = await this.get('ajax').getFreeFunding(wallet.currency);
      wallet.openOrders = await this.get('ajax').getActiveFundingOrders(wallet.currency);
    }

    return { fundingWallets: wallets };
  }
});
