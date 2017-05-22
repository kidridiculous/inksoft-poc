define('classification/groups/ClassificationGroup',['classification/groups/GroupLink'], function(GroupLink) {
    
    class ClassificationGroup {

        /* [MM] TS Types
            definitions:string[]; //definitions that are included in this group
            groupName:string; //The name of this group
            description:string; //Description of the group
            links:GroupLink[]; //The links between groups and definitions
         */

        constructor(group, options) {
            
            this.definitions = group.definitions;
            this.groupName = group.groupName;
            this.description = group.description || '';
            this.links = group.links.map((link) => {
                return new GroupLink(link);
            });



        }


        matchOnClassifiers(classifiers) {
            const matchInfo = {
                match: false
            }
            //Get all the classifiers  
            const classifiersInGroup = classifiers.filter((cls) => {
                return this.definitions.includes(cls.definition);
            }, this);

            
            const linkMatches = this.findLinkMatches(classifiersInGroup, this.links);

            matchInfo.match = classifiersInGroup.length === this.definitions.length && linkMatches.matching.length === this.links.length;
            matchInfo.links = linkMatches;
            matchInfo.missingDefinitions = this.definitions.filter((def) => 
                { 
                    return classifiersInGroup.findIndex((cls) => { 
                        return cls.definition === def;
                    }) < 0; 
                });

            return matchInfo;

        }

        findLinkMatches(classifiers, groupLinks) {
            let result = {
                matching:[],
                missing:[]
            }

            groupLinks.forEach((link) => {
                const target = classifiers.find((cls) => { return cls.definition === link.targetDefinition;});
                const chain = classifiers.find((cls) => { return cls.definition === link.chainDefinition;});
                if(target !== undefined && chain !== undefined && link.matchTargetToChain(target, chain)) {
                    result.matching.push(link);
                } else {
                    result.missing.push(link);
                }
            })


            return result;
        }

    }

    return ClassificationGroup;

})