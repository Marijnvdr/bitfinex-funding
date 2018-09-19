import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('funding', { path: '/' });
  this.route('free');
  this.route('rates');
  this.route('wallets');
});

export default Router;
