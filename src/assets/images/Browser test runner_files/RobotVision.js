define('controller/RobotVision', [], function() {


    let latestVision = null;

	class RobotVision {

		constructor() {
			
		}

		static getVision() {
			return latestVision;
		}

        static setVision(vision) {
            latestVision = vision;
        }

        static hasVision() {
            return latestVision !== null;
        }
    }

	return RobotVision;

});