import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash, all } from 'rsvp';


export default Route.extend({
  ajax: service('bitfinex-api'),

  model() {
    return this.get('ajax').getFundingWallets().then(wallets => {
      let promises = [];
      wallets.map((wallet) => {
        let p = this.get('ajax').getFreeFunding(wallet.currency);
        promises.push(p);
      });
      return all(promises).then((values) => {
        for (let i = 0; i < wallets.length; i++) {
          wallets[i].amountFree = values[i];
        }
      }).then(() => {
        return hash({
          fundingWallets: wallets
        });
      });
    });
  }
});
