'use strict';

module.exports = Component => class extends Component {
    connect () {
        this.state = this.state.set('connection', 'somedb');
        return this.after();
    }
}
