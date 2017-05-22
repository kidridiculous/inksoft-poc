define('controller/RobotConfig', [], function() {

	const validProperties = ['name', 'tagName', 'className', 'title', 'buttontext', 'type'];

	class RobotConfig {

		static propertiesAreValid(props) {
			return props.every((property) => {
				return validProperties.includes(property);
			});
		}

		constructor(options) {
			const xResolution = (options && options.xResolution) ? options.xResolution : 8;
			const yResolution = (options && options.yResolution) ? options.yResolution : 8;

			this.setXResolution(xResolution);
			this.setYResolution(yResolution);
			this.setDomClassiferCompareProperties(validProperties);
		}

		setXResolution(value) {
			if (value <= 0) throw new Error('X Resolution must be greater than 0');

			this.xResolution = value;
		}

		getXResolution() {
			return this.xResolution;
		}

		setYResolution(value) {
			if (value <= 0) throw new Error('Y Resolution must be greater than 0');

			this.yResolution = value;
		}

		getYResolution() {
			return this.yResolution;
		}

		getDomClassiferCompareProperties() {
			return this.domClassiferCompareProperties;
		}

		setDomClassiferCompareProperties(props) {
			if (RobotConfig.propertiesAreValid(props)) {
				this.domClassiferCompareProperties = props;
			} else {
				throw new Error('Invalid compare properties set for dom classification');
			}
		}
	}

	return new RobotConfig();
});
