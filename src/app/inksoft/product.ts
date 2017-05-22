export class Product {
    name: string;
    id: string;
    manufacturer: string;
    manufacturerSku: string;
    productCategoryId: string;
    sku:string;
    isStatic:boolean;
    category:string;
    productStyleId:string;
    productStyleUri:string;
    isDefault:boolean;
    color:string;
    htmlColor:string;
    canPrint:boolean;
    canDigitalPrint:boolean;
    canScreenPrint:boolean;
    canEmbroider:boolean;
    requireDesign:boolean;
    unitPrice:number;
    namePrice:string;
    numberPrice:number;
    thumbUrlFront:string;
    thumbUrlFrontCached:string;
    imageUrlFront:string;
    imageUrlFrontCached:string;

    /*
        <CS category="Ladies" 
            manufacturer="Bella + Canvas" 
            manufacturer_sku="B8800" 
            product_id="1000019" 
            product_category_id="1000012" 
            sku="B8800" 
            is_static="0" 
            name="Ladies’ 3.7 oz. Flowy Racerback Tank" 
            product_style_id="1000568" 
            product_style_uri="WHITE" 
            is_default="1" 
            color="WHITE" 
            html_color="FFFFFF" 
            can_print="1" 
            can_digital_print="1" 
            can_screen_print="1" 
            can_embroider="0" 
            require_design="0" 
            unit_price="12.24" 
            name_price="5.00" 
            number_price="5.00" 
            thumburl_front="REPLACE_DOMAIN_WITH/images/products/1664/products/B8800/WHITE/front/150.png" 
            thumburl_front_cached="REPLACE_DOMAIN_WITH/images/cache/publishers/3414/products/B8800/WHITE.Front.80.png" 
            imageurl_front="REPLACE_DOMAIN_WITH/images/products/1664/products/B8800/WHITE/front/500.png" 
            imageurl_front_cached="REPLACE_DOMAIN_WITH/images/cache/publishers/3414/products/B8800/WHITE.Front.500.png" />
    */
    fromXml(el:Element) {
        this.name = el.hasAttribute('name') ? el.getAttribute('name') : '';
        this.id = el.hasAttribute('product_id') ? el.getAttribute('product_id') : '';
        this.manufacturer = el.hasAttribute('manufacturer') ? el.getAttribute('manufacturer') : '';
        this.manufacturerSku = el.hasAttribute('manufacturer_sku') ? el.getAttribute('manufacturer_sku') : '';
        this.productCategoryId = el.hasAttribute('product_category_id') ? el.getAttribute('product_category_id') : '';
        this.sku = el.hasAttribute('sku') ? el.getAttribute('sku') : '';
        this.isStatic = el.hasAttribute('is_static') ? (el.getAttribute('is_static') === '1' ? true : false) : false;
        this.category = el.hasAttribute('category') ? el.getAttribute('category') : '';
        this.productStyleId = el.hasAttribute('product_style_id') ? el.getAttribute('product_style_id') : '';
        this.productStyleUri = el.hasAttribute('product_style_uri') ? el.getAttribute('product_style_uri') : '';
        this.isDefault = el.hasAttribute('is_default') ? (el.getAttribute('is_default') === '1' ? true : false) : false;
        this.color = el.hasAttribute('color') ? el.getAttribute('color') : '';
        this.htmlColor = el.hasAttribute('html_color') ? el.getAttribute('html_color') : '';
        this.canPrint = el.hasAttribute('can_print') ? (el.getAttribute('can_print') === '1'?true:false) :false;
        this.canDigitalPrint = el.hasAttribute('can_digital_print') ? (el.getAttribute('can_digital_print') === '1' ? true : false) : false;
        this.canScreenPrint = el.hasAttribute('can_screen_print') ? (el.getAttribute('can_screen_print') === '1' ? true:false) : false;
        this.canEmbroider = el.hasAttribute('can_embroider') ? (el.getAttribute('can_embroider') === '1' ? true:false): false;
        this.requireDesign = el.hasAttribute('require_design') ? (el.getAttribute('require_design') === '1' ? true:false) : false;
        this.unitPrice = el.hasAttribute('unit_price') ? parseFloat(el.getAttribute('unit_price')) : 0;
        this.namePrice = el.hasAttribute('name_price') ? el.getAttribute('name_price') : '';
        this.numberPrice = el.hasAttribute('number_price') ? parseFloat(el.getAttribute('number_price')) : 0;
        this.thumbUrlFront = el.hasAttribute('thumburl_front') ? el.getAttribute('thumburl_front') : '';
        this.thumbUrlFrontCached = el.hasAttribute('thumburl_front_cached') ? el.getAttribute('thumburl_front_cached') : '';
        this.imageUrlFront = el.hasAttribute('image_url_front') ? el.getAttribute('image_url_front') : '';
        this.imageUrlFrontCached = el.hasAttribute('image_url_front_cached') ? el.getAttribute('image_url_front_cached') : '';

        this.thumbUrlFront = this.thumbUrlFront.replace('REPLACE_DOMAIN_WITH', 'http://stores.inksoft.com');
        this.thumbUrlFrontCached = this.thumbUrlFrontCached.replace('REPLACE_DOMAIN_WITH', 'http://stores.inksoft.com');
        this.imageUrlFront = this.imageUrlFront.replace('REPLACE_DOMAIN_WITH', 'http://stores.inksoft.com');
        this.imageUrlFrontCached = this.imageUrlFrontCached.replace('REPLACE_DOMAIN_WITH', 'http://stores.inksoft.com');
    }

}