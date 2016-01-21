import { Component } from 'angular2/core';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { INCREMENT, DECREMENT, RESET } from './counter';

@Component({
    selector: 'counter-app',
    template: `
        <button (click)="increment()">Increment</button>
        <div>Current Count: {{ counter | async }}</div>
        <button (click)="decrement()">Decrement</button>
    `
})
export class App {
    counter: Observable<number>;
    constructor(public store: Store<number>){
        this.counter = store.select('counter');
    }
    increment() {
        this.store.dispatch({ type: INCREMENT });
    }
    decrement() {
        this.store.dispatch({ type: DECREMENT });
    }
    reset() {
        this.store.dispatch({ type: RESET });
    }
}
