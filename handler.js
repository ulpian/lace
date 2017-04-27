'use strict';

const Immutable = require('immutable');
const Lace = require('./Lace');

const awsLambda = Component => class extends Component {
    storeHandler (event, context, callback) {
        if (event.body) {
            try{
                event.rawBody = _.cloneDeep(event.body)
                event.body = JSON.parse(event.body);
            } catch (err) {
                try {
                    event.rawBody = _.cloneDeep(event.body)
                    event.body = qs.parse(event.body);
                } catch (errs) {
                    throw new Error('Please format your json or qs body accordingly.');
                }
            }
        }

        this.state = this.state.setIn(['meta'], {
            handler: Immutable.Map({
                event: event,
                context: context,
                callback: callback
            })
        });
        return this.after();
    }
    respond () {
        this.state.get('meta').handler.get('callback')(null, true);
        return this.after();
    }
}

const state = new Lace()
.register('pg-database', require('./pg-database'))
.register('model', require('./model'))
.register('awsLambda', awsLambda)
.combine();

// Handler
exports.test = (event, context, callback) => {
    let slice = new state()
            .register('path', require('path'))
            .storeHandler(event, context, callback)
            .connect()
            .setModel()
            .errorTest(0)
            .run((state) => {
                return state.set('foo', 'bar');
            })
            .run((state) => {
                let event = state.get('meta').handler.get('event');
                let context = state.get('meta').handler.get('context');
                let callback = state.get('meta').handler.get('callback');
                console.log(event);
                console.log(context);
                console.log(callback)
            })
            .endState();

    return new state()
            .setState(slice)
            .respond();
};
