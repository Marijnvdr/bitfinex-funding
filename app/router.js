import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('funding', { path: '/' });
  this.route('open');
  this.route('rates');
  this.route('wallets');
  this.route('margin');
});

export default Router;
