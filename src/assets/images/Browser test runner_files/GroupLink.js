define('classification/groups/GroupLink',[], function() {

    const LINK_TYPES = { LEFT_TO_RIGHT:'LEFT_TO_RIGHT', TOP_TO_BOTTOM:'TOP_TO_BOTTOM'}

    function matchLeftToRight(target, chain) {
        return target.xmax < chain.xmin;
    }

    function matchTopToBottom(target, chain) {
        return target.ymin < chain.ymin;    
    }


    const LINK_FUNCTIONS = {};

    LINK_FUNCTIONS[LINK_TYPES.LEFT_TO_RIGHT] = matchLeftToRight;
    LINK_FUNCTIONS[LINK_TYPES.TOP_TO_BOTTOM] = matchTopToBottom;

    /* Defines the link/relationships to definitions and groups belonging to a group */
    class GroupLink {

        /* [MM] TS Types
            targetDefinition:string; //The definition that is the target of defining the link
            chainDefinition:string; //The definition that is chained to the the target
            linkType:string; //Identify other groups contained in this group
         */

        constructor(link, options) {
            this.targetDefinition = link.targetDefinition;
            this.chainDefinition = link.chainDefinition;
            this.linkType = link.linkType;
        }

        matchTargetToChain(targetCls, chainCls) {
            const targetEl = targetCls.getElement(), chainEl = chainCls.getElement();

            return this.matchByLinkType(targetEl, chainEl);
        }

        matchByLinkType(targetEl, chainEl) {
            return LINK_FUNCTIONS[this.linkType](targetEl, chainEl);
        }
    }

    return GroupLink;

})