define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var Workflow = require('goal/Workflow');
  var Workflow = require('goal/Workflow');

  
  registerSuite({
    name: 'Workflow',
    'it gets initial goal': function () {
      var goal1 = {isComplete:function(){return false;}, getScanOptions: function() { return{};}};
      var goal2 = {isComplete:function(){return false;}, getScanOptions: function() { return{};}};
      var workflow = new Workflow([goal1, goal2]);

      var result = workflow.getActiveGoal();

      assert.equal(result, goal1,
        'Active goal should be first goal');
    },
    'it moves to the second goal': function () {
      var goal1 = {isComplete:function(){return true;}, getScanOptions: function() { return{};}};
      var goal2 = {isComplete:function(){return false;}, getScanOptions: function() { return{};}};
      var workflow = new Workflow([goal1, goal2]);

      workflow.getActiveGoal();
      var result = workflow.getActiveGoal();

      assert.equal(result, goal2,
        'Active goal should be second goal');
    }

  });

})