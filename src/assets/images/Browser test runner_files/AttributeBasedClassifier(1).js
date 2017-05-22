define('classification/AttributeBasedClassifier',['classification/ScanClassifier','service/Knowledge', 'classification/ProductAttributeClassifier'], 
	function(ScanClassifier, Knowledge, ProductAttributeClassifier) {

	class AttributeBasedClassifier extends ScanClassifier {

		constructor(merchantId, productData) {
			super(merchantId);
			this.productData = productData;
			this.createAttributeClassifiers();
		}

		createAttributeClassifiers(){
			
			let attributes = this.productData.attributes, attrDefinition='';
			let attributeDefinitions = Object.keys(attributes);

			for(var index in attributeDefinitions) {

				let attrData = attributes[attributeDefinitions[index]];

                //Create a convention based definition for the product attribute so we don't overlap with existing definitions
                attrDefinition = 'productAttribute.' + attributeDefinitions[index];
			
                //Create a ProductAttributeClassifier 
				let classifier = new ProductAttributeClassifier(attrDefinition, attrData);

                //Add the product attribute classifier to the rest of the classifiers
				this.classifiers.push(classifier);
			}
		}	

        update(scanData){
            super.update(scanData); // return 
        }

	}

	return AttributeBasedClassifier;

});		





/*

{
    "price": 68,
    "retailerId": 66,
    "retailer": "Abercrombie",
    "stocks": 43,
    "quantity": 1,
    "wid": "7145131",
    "sid": "622167323",
    "picture": "http://anf.scene7.com/is/image/anf/anf_121976_02_prod1",
    "url": "https://www.abercrombie.com/shop/us/mens-polos-tops/icon-polo-7616144_07?ofp=true",
    "xid": "66_5623d7ac4af6a10b07bc78e02a1ca813d7801b20",
    "currency": "$",
    "status": 1,
    "name": "Waffle Henley Sweater",
    "attributes": {
        "color": {
            "label": "GREY",
            "title": "Color",
            "value": "GREY",
            "icon": "https://anf.scene7.com/is/image/anf/anf_126054_sw112x112?wid=42"
        },
        "size1": {
            "label": "M",
            "title": "Size",
            "value": "M"
        }
    }
}


*/