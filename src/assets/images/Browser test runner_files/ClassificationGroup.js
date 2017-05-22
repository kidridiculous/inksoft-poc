define(function (require) {
	var registerSuite = require('intern!object');
	var assert = require('intern/chai!assert');
	var ClassificationGroup = require('classification/groups/ClassificationGroup');

    var getSignInGroup = function() {

        const group = {
            definitions: ['signInContext', 'username', 'password', 'signInContinue'],
            groupName:'signIn',
            description: '',
            links: []
        }

        group.links.push({targetDefinition:'signInContext',linkType:'TOP_TO_BOTTOM', chainDefinition:'username'});
        group.links.push({targetDefinition:'username',linkType:'TOP_TO_BOTTOM', chainDefinition:'password'});
        group.links.push({targetDefinition:'password',linkType:'TOP_TO_BOTTOM', chainDefinition:'signInContinue'});
                
        return new ClassificationGroup(group);

    }

    var getClassifiers = function() {
        return [
            {definition:'signInContext', getElement:()=>{ return {xmin:0, xmax:200, ymin:0,ymax:50};}},
            {definition:'username', getElement:()=>{ return {xmin:20, xmax:180, ymin:75,ymax:100};}},
            {definition:'password', getElement:()=>{ return {xmin:20, xmax:180, ymin:125,ymax:150};}},
            {definition:'signInContinue', getElement:()=>{ return {xmin:20, xmax:180, ymin:175,ymax:200};}}
        ];
    }


	registerSuite({
		name: 'ClassificationGroup',
		'Group does not match when not all definitions are found':function() {
			const instance = getSignInGroup();
            //remove password and signInContinue
            let classifierMocks = getClassifiers().slice(0,2);
            
            

            const result = instance.matchOnClassifiers(classifierMocks);

			assert.isFalse(result.match, 'should NOT match when all definitions are NOT found');

		},
        'matchOnClassifiers return missing definitions':function() {
			const instance = getSignInGroup();
            //remove password and signInContinue
            let classifierMocks = getClassifiers().slice(0,2);
            const result = instance.matchOnClassifiers(classifierMocks);

			assert.deepEqual(result.missingDefinitions, ['password', 'signInContinue'], 'should NOT match when all definitions are NOT found');

		},
        'matchOnClassifiers returns matching links':function() {
			const instance = getSignInGroup();
            //remove password and signInContinue
            let classifierMocks = getClassifiers();
            const result = instance.matchOnClassifiers(classifierMocks);

			assert.equal(result.links.matching.length, 3,'Should have 4 matching links');

		},
        'matchOnClassifiers returns missing links':function() {
			const instance = getSignInGroup();
            //remove password and signInContinue
            let classifierMocks = getClassifiers().slice(0,3);
            const result = instance.matchOnClassifiers(classifierMocks);

			assert.equal(result.links.missing.length, 1,'Should have 1 missing links');
		}
	});
});