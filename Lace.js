'use strict';

// lace
const Immutable = require('immutable');

// Sharable state as state is simply an exportable laceect
// Running custom funtions within lace
// Entire stack must
// Connection and IO operations can be held within the state with timestamps, if calls are made and they are old then they can be closed to open new connections.
// This will allow a pool of connections to be shared amongst various clients making all calls to the same pool - multiplexing

class Core {
    constructor () {
        this.state = Immutable.Map({
            connection: 'hey',
            meta: {},
            deps: Immutable.Map({
                immutable: require('immutable')
            }),
            Components: this.components()
        })
    }
    after () {
        return this;
    }
    catch (error) {
        console.error(error.toString());
        return this;
    }
    register (name, source) {
        this.state = this.state.setIn(['deps', name], source);
        return this.after();
    }
    setState (state) {
        this.state = state;
        return this.after();
    }
    setInState (key, value) {
        this.state = this.state.set(key, value);
        return this.after();
    }
    run (fn) {
        try {
            let runState = fn(this.state);
            if (runState) this.state = runState;
            return this.after();
        } catch (error) {
            return this.catch(error);
        }
    }
    connect () {
        this.state = this.state.set('connection', 'postgres');
        return this.after();
    }
    errorTest (e) {
        try {
            if (e === 1) {
                throw new Error('error');
            }

            return this.after();
        } catch (error) {
            return this.catch(error);
        }
    }
    log () {
        console.log(this.state.toJS());
        return this.after();
    }
    endState () {
        return this.state;
    }
}

// To-do: list the components that are used within the state
class Components {
    constructor () {
        this.components = [];
    }
    register (components, source) {
        if (typeof components === 'object' && components.length && source === undefined) {
            for (let c of components) {
                this.components.push({name: c.name, source: c.source});
            }
        } else if (typeof components === 'string' && source !== undefined) {
            this.components.push({name: components, source: source});
        } else {
            throw new Error('You must register a component either as an object (single component) or as an array (multiple components).');
        }
        return this;
    }
    combine () {
        let components = this.components;
        let stack = null;
        for (let i = (this.components.length - 1); i > -1; i--) {
            if (i === (this.components.length - 1)) {
                stack = this.components[i].source(Core);
            } else {
                stack = this.components[i].source(stack);
            }
            if (i === 0) return class extends stack { components () { return components; } }
        }
    }
}

module.exports = Components;
