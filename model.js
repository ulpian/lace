'use strict';

module.exports = Component => class extends Component {
    setModel () {
        this.state = this.state.set('model', {
            name: 'Ulpian',
            age: 25
        });
        return this.after();
    }
}
