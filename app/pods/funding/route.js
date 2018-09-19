import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service('bitfinex-api'),

  async model() {
    let wallets = await this.get('ajax').getFundingWallets();
    let funded = [];
    for (let wallet of wallets) {
      funded.push(await this.get('ajax').getSuppliedFunding(wallet.currency));
    }

    return { fundedCurrencies: funded };
  }
});
