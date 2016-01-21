import { bootstrap } from 'angular2/platform/browser';
import { provideStore } from '@ngrx/store';
import { App } from './app';

import { counter } from './counter';

bootstrap(App, [ provideStore({ counter }, { counter: 0 }) ]);
