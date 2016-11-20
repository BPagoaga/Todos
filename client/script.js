// jquery
var $ = require('jquery');
var todoTemplate = require("../views/partials/todo.hbs");

$(function() {

    // AJAX function called when adding a todo
    var addTodo = function() {
        var text = $('#add-todo-text').val();
        $.ajax({
            url: '/api/todos',
            type: 'POST',
            data: {
                text: text
            },
            dataType: 'json',
            success: function(data) {
                var todo = data.todo;
                var newLiHtml = todoTemplate(todo);
                $('form + ul').append(newLiHtml);
                $('#add-todo-text').val('');
            }
        });
    };

    // AJAX function called when updating a todo
    var updateTodo = function(id, data, cb) {
        $.ajax({
            url: '/api/todos/' + id,
            type: 'PUT',
            data: data,
            dataType: 'json',
            success: function(data) {
                cb();
            }
        });
    };

    // AJAX function called when deleting a todo
    var deleteTodo = function(id, cb) {
        $.ajax({
            url: '/api/todos/' + id,
            type: 'DELETE',
            data: {
                id: id
            },
            dataType: 'json',
            success: function(data) {
                cb();
            }
        });
    };

    // remove the list item once it's delete
    var deleteTodoLi = function($li) {
        $li.remove();
    };

    // event handler to change the state of a todo
    $('ul').on('change', 'li :checkbox', function() {
        var $this = $(this),
            $input = $this[0],
            $li = $this.parent(),
            id = $li.attr('id'),
            checked = $input.checked,
            data = { done: checked };
        updateTodo(id, data, function(d) {
            $this.parent().toggleClass('checked');
        });
    });

    // event hander to change the text of a todo
    $('ul').on('keydown', 'li span', function(e) {
        var $this = $(this),
            $span = $this[0],
            $li = $this.parent(),
            id = $li.attr('id'),
            key = e.keyCode,
            target = e.target,
            text = $span.innerHTML,
            data = {
                text: text
            };
        $this.addClass('editing');
        if (key === 27) { //escape key
            $this.removeClass('editing');
            document.execCommand('undo');
            target.blur();
        } else if (key === 13) { //enter key
            updateTodo(id, data, function(d) {
                $this.removeClass('editing');
                target.blur();
            });
            e.preventDefault();
        }
    });

    // event handler for adding a todo by hitting the add button
    $(":button").on('click', addTodo);

    // event handler for adding a todo by hitting the enter key
    $(":text").on('keypress', function(e) {
        var key = e.keyCode;
        if (key == 13 || key == 169) {
            addTodo();
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // event handler to delete a todo
    $('ul').on('click', 'li a', function() {
        var $this = $(this),
            $input = $this[0],
            $li = $this.parent(),
            id = $li.attr('id');
        deleteTodo(id, function(e) {
            deleteTodoLi($li);
        });
    });

    // observer
    var initTodoObserver = function() {
        var target = $('ul')[0];
        var config = {
            attributes: true,
            childList: true,
            characterData: true
        };
        var observer = new MutationObserver(function(mutationRecords) {
            $.each(mutationRecords, function(index, mutationRecord) {
                updateTodoCount();
            });
        });
        observer.observe(target, config);
        updateTodoCount();
    };

    // the function to count todos
    var updateTodoCount = function() {
        $(".count").text($("li").length);
    };

    // calling the observer on DOM ready
    initTodoObserver();

    // filtering the todos
    $('.filter').on('click', '.show-all', function() {
        $('.hide').removeClass('hide');
    });
    $('.filter').on('click', '.show-not-done', function() {
        $('.hide').removeClass('hide');
        $('.checked').closest('li').addClass('hide');
    });
    $('.filter').on('click', '.show-done', function() {
        $('li').addClass('hide');
        $('.checked').closest('li').removeClass('hide');
    });

    // event to clear all the todos
    $(".clear").on("click", function() {
        var $doneLi = $(".checked").closest("li");
        for (var i = 0; i < $doneLi.length; i++) {
            var $li = $($doneLi[i]); //you get a li out, and still need to convert into $li
            var id = $li.attr('id');
            (function($li) {
                deleteTodo(id, function() {
                    deleteTodoLi($li);
                });
            })($li);
        }
    });

});