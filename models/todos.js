var mongoose = require('mongoose');

var Promise = require('bluebird');
Promise.promisifyAll(mongoose);

var Schema = mongoose.Schema;

var TodoSchema = new Schema({
    text: {type: 'String', required: true},
    done: {type: 'Boolean'}
});
var Todo = mongoose.model('Todo', TodoSchema);
;
module.exports = Todo;