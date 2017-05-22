define('goal/Workflow', ['controller/RobotConfig', 'util/StatusMessage'], function(RobotConfig, StatusMessage) {

	class GenericWorkflow {	

		//TS
		// _startedGoals:Array<AbstractGoal>;
		// _completedGoals:Array<AbstractGoal>;

		constructor(goals) {
			this.completed = false;
			this.goals = goals;
	
			if(!this.goals || this.goals.length === 0) {
				this.completed = true;
			}

			this._startedGoals = [];
			this._completedGoals = [];
		}

	    setComplete(value) {
				this.completed = value;
	    }

		isComplete() {
			return this.completed;
		}

		getActiveGoal() {
			let activeGoal = null;
			let completedGoalCount = 0;
			
			this.goals.forEach(function(g){
				if(activeGoal === null) {
					if(!g.isComplete()) {
						activeGoal = g;
						if(!this._startedGoals.includes(activeGoal)) {
							this._startedGoals.push(activeGoal);
							StatusMessage.sendGoalStart(activeGoal);
						} 
					} else if( g.isComplete() ){
						if(!this._completedGoals.includes(g)) {
							this._completedGoals.push(g);
							StatusMessage.sendGoalComplete(g);
						}
						completedGoalCount += 1;
					}
				}
			}, this);

			this.activeGoal = activeGoal;

			if(this.activeGoal)
			{
				RobotConfig.setXResolution(this.activeGoal.getScanOptions().xResolution);
				RobotConfig.setYResolution(this.activeGoal.getScanOptions().yResolution);
			}

			if(completedGoalCount === this.goals.length) {
				this.completed = true;
			}

			return this.activeGoal;
		}

	}

	return GenericWorkflow;
})