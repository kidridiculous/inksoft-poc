define('util/StatusMessage', ['lib/socket.io'], function(Socket){

	var socket = Socket('http://localhost:2087');
	console.log('connecting Socket for StatusMessage ')	

	class StatusMessage {

		constructor() {}

		static sendCompleted(exitCode, startTime, lastVision, callback){

			if(exitCode == 1){
				var successful = true;
			}else{
				var successful = false;
			}
			
			var data = {
				message:'PROGRESS_COMPLETE',	
				exitCode:exitCode,		
				end:successful,
				successful:successful,
				startTime:startTime,
				endTime:Date.now(),
				lastVision: lastVision
			}

			console.log('StatusMessage.sendCompleted : ' + data);

			socket.emit('PROGRESS_COMPLETE', data, callback);
		}

		static sendProgress(message){

			var data = {
				message:message,
				date:Date.now()
			}

			//console.log('StatusMessage.PROGRESS_UPDATE : ' + JSON.stringify(data,null,4) );

			socket.emit('PROGRESS_UPDATE', data);
		}

		static sendTask(taskData){

			var data = {
				type:'TASK_PROGRESS',
				message:'Executing task ' + taskData.task + ' on definition ' + taskData.definition,
				date:Date.now(),
				task: taskData.task,
				definition: taskData.definition
			}

			socket.emit('TASK_PROGRESS', data);
		}

		static sendUseModel(useModelData) {
			const msg = useModelData.message || 'Beginning use model ' + useModelData.useModel + ' on definition ' + useModelData.definition;
			const data = {
				type:'USE_MODEL_PROGRESS',
				message:msg,
				date:Date.now(),
				useModel: useModelData.useModel,
				definition: useModelData.definition,

			}

			if(useModelData.element) {
				data['targetElement'] = useModelData.element;
			}

			socket.emit('USE_MODEL_PROGRESS', data);
		}

		static sendGoalStart(goal) {
			var data = {
				type:'GOAL_PROGRESS',
				message:goal.constructor.name + ' starting',
				date:Date.now(),
				goal: goal.constructor.name
			}

			socket.emit('GOAL_PROGRESS', data);
		}

		static sendGoalComplete(goal) {
			var data = {
				type:'GOAL_PROGRESS',
				message:goal.constructor.name + ' completed',
				date:Date.now(),
				goal: goal.constructor.name
			}

			socket.emit('GOAL_PROGRESS', data);
		}

		// static sendErrorTrace(error){

		// 	var errObject = {
		// 		message:'ERROR_TRACE',
		// 		date:Date.now(),
		// 		errorMessage:error.errorMessage,
		// 		error:error
		// 	}

		// 	console.log('StatusMessage.ERROR_TRACE : ' + msg );

		// 	socket.emit('ERROR_TRACE', errObject);
		// }
	}

	return StatusMessage;

});