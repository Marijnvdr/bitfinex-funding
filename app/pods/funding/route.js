import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash, all } from 'rsvp';


export default Route.extend({
  ajax: service('bitfinex-api'),

  model() {
    return this.get('ajax').getFundingWallets().then(wallets => {
      let promisesFree = [];
      let promisesOrders = [];
      wallets.map((wallet) => {
        let pf = this.get('ajax').getFreeFunding(wallet.currency);
        promisesFree.push(pf);
        let po = this.get('ajax').getActiveFundingOrders(wallet.currency);
        promisesOrders.push(po);
      });
      return all(promisesFree).then((values) => {
        for (let i = 0; i < wallets.length; i++) {
          wallets[i].amountFree = values[i];
        }
      }).then(() => {
        return all(promisesOrders).then((values) => {
          for (let i = 0; i < wallets.length; i++) {
            wallets[i].openOrders = values[i];
          }
        })
        }).then(() => {
          return hash({
          fundingWallets: wallets
        });
      });
    });
  }
});
