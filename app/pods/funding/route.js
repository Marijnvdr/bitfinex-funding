import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';


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
    let funded = [];
    for (let currency of currencies) {
      funded.push(await this.get('ajax').getSuppliedFunding(currency));
    }

    return hash({
      fundingWallets: wallets,
      fundedCurrencies: funded,
      currencyRates: await this.get('ajax').getCurrentFundingRates(currencies)
    });
  }
});
