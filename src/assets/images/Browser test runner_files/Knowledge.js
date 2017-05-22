// dictionaries that define knowledge
// TODO IN THE FUTURE would be subbed out by a centralized knowledge service that we make REST/API calls to

define('service/Knowledge', ['service/DefinitionTable'], function(DefinitionTable) {

	class Knowledge {
		constructor() {

		    // TODO Need to enumerate the lookup table definitions so we don't have strings hard coded every to reference classified elements

			const defTable = new DefinitionTable();
            this.definitions = defTable.definitions;

			this.lookupTable = {};
			this.generateReverseLookupTable();
		}

		generateReverseLookupTable() {
			const self = this;

			for (let definition in this.definitions) {
				const keywords = self.definitions[definition].keyWords;

				keywords.forEach(function(item) {
					const isKey = self.lookupTable.hasOwnProperty(item);
					if (isKey) {
						self.lookupTable[item].push(definition);
					} else {
						self.lookupTable[item] = [definition];
					}	
				});
			}
		}

		getKeywordDefinitions(unknownWord) {
			let definitions = null,
				wordIsKnownInDictionary = false,
				wordIsKnownAsAttribute = false;

			if (unknownWord !== undefined && unknownWord !== null) {

				const lowerCaseUnknown = unknownWord.toLowerCase();

				wordIsKnownInDictionary = this.lookupTable.hasOwnProperty(lowerCaseUnknown);

				if (wordIsKnownInDictionary) {
					definitions = this.lookupTable[lowerCaseUnknown];
				}
			}

			return definitions;
		}

		getClassificationDefinition(definitionName) {
			return this.definitions[definitionName];
		}

		getDefinitions() {
			return this.definitions;
		}

		getDefinitionNames() {
			return Object.keys(this.definitions);
		}
       
		setDefinitionTable(merchantID, completion) {
			// this will replace the default definitiontable with a specific one
			const merchantConfig = `merchant/${merchantID}/DefinitionTable`;
			const topLevel = this;

			// load Merchant Configuration
			require([merchantConfig], function(Config) {
				const defTable = new Config;
				topLevel.definitions = defTable.definitions;
				topLevel.lookupTable = {};
				topLevel.generateReverseLookupTable();
				completion();
			});
		}

		// method to add a new defintion (including options) to the current instance of DefinitionTable; used for custom merchant setups via the merchant config
		addNewDefinition(definitionKey, definitionObject) {
			// check if both arguments are present
			if (!definitionKey || !definitionObject) {
				return new Error('must provide two arguments to add new definition');
			}

			// check if definitionKey is valid
			if (typeof definitionKey !== 'string') {
				return new Error('definitionKey must be valid to add new definition');
			}
			
			// check if definitionObject is valid
			if (Array.isArray(definitionObject) || typeof definitionObject !== 'object') {
				return new Error('definitionObject must be valid to add new definition');
			}
			
			// check if the definition already exists
			if (definitionKey in this.definitions) {
				return new Error('definition key must be empty to add new definition');
			}

			this.definitions[definitionKey] = definitionObject;

			return this.definitions[definitionKey];
		}

		// method to add additional match keywords and existing new defintion to the current instance of DefinitionTable; used for custom merchant setups via the merchant config
		addKeywordsToExistingDefinition(definitionKey, keywordsArr) {
			// check if both arguments are present
			if (!definitionKey || !keywordsArr) {
				return new Error('must provide two arguments to add new definition');
			}

			// check if definitionKey and keyword are valid
			if (typeof definitionKey !== 'string' || !Array.isArray(keywordsArr) || !keywordsArr.every(function(keyword) {
				return typeof keyword === 'string';
			})) {
				return new Error('definitionKey and keyword arguments must be valid to add new definition');
			}

			// check if the definition already exists
			if (!(definitionKey in this.definitions)) {
				return new Error('definition key must already exist to add new keyword');
			}

			this.definitions[definitionKey].keyWords = this.definitions[definitionKey].keyWords.concat(keywordsArr);

			return this.definitions[definitionKey].keyWords;
		}

		removeKeywordFromExistingDefinition(definitionKey, keyword) {
			// check if both arguments are present
			if (!definitionKey || !keyword) return new Error('must provide two arguments to remove definition keyword');

			// check if definitionKey and keyword are valid
			if (typeof definitionKey !== 'string' || typeof keyword !== 'string') {
				return new Error('definitionKey and keyword arguments must be valid to add new definition');
			}

			// check if the definition already exists
			if (!(definitionKey in this.definitions)) return new Error('definition key must already exist to add new keyword');

			this.definitions[definitionKey].keyWords = this.definitions[definitionKey].keyWords.filter(function(k) { return k !== keyword; });

			return this.definitions[definitionKey].keyWords;
		}

		// method to add or update the classifier for a given definition for the current instance of DefinitionTable; used for custom merchant setups via the merchant config
		upsertClassifierToExistingDefinition(definitionKey, upsertClassifier) {
			// check if both arguments are present
			if (!definitionKey || !upsertClassifier) {
				return new Error('must provide two arguments to upsert a classifier');
			}

			// check if definitionKey and upsertClassifier are valid
			if (typeof definitionKey !== 'string' || typeof upsertClassifier !== 'string') {
				return new Error('definitionKey and upsertClassifier arguments must be valid to upsert a classifier');
			}

			// check if the definition already exists
			if (!(definitionKey in this.definitions)) {
				return new Error('definition key must already exist to add new keyword');
			}

			this.definitions[definitionKey].classifier = upsertClassifier;

			return this.definitions[definitionKey].classifier;
		}

		removeKeywordFromExistingDefinition(definitionKey, keyword) {
			// check if both arguments are present
			if (!definitionKey || !keyword) return new Error('must provide two arguments to remove definition keyword');

			// check if definitionKey and keyword are valid
			if (typeof definitionKey !== 'string' || typeof keyword !== 'string') {
				return new Error('definitionKey and keyword arguments must be valid to add new definition');
			}

			// check if the definition already exists
			if (!(definitionKey in this.definitions)) return new Error('definition key must already exist to add new keyword');

			this.definitions[definitionKey].keyWords = this.definitions[definitionKey].keyWords.filter(function(k) { return k !== keyword; });

			return this.definitions[definitionKey].keyWords;
		}
	}

	return new Knowledge();
});
