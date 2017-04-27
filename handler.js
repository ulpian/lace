'use strict';

const Immutable = require('immutable');
const Lace = require('./Lace');

const awsLambda = Component => class extends Component {
    storeHandler (event, context, callback) {
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

const lace = new Lace()
.register('database', require('./database'))
.register('model', require('./model'))
.register('awsLambda', awsLambda)
.combine();

// Handler
exports.test = (event, context, callback) => {
    return new lace()
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
                console.log(event);
            })
            .respond();
};
