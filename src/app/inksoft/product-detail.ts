import { Product } from './product';

export class ProductDetail extends Product {
    
    mfrImageSquare:string;
    mfrImageTiny:string;
    canHandleSleeves:boolean;
    enableTeamNameNumbers:boolean;
    hasBack:boolean;
    hasThirdSide:boolean;
    hasFourthSide:boolean;
    thirdSideName:string;
    fourthSideName:string;
    productType:string;
    includeGrommets:boolean;
    longDescription:string;

    styles:ProductStyle[];
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

        super.fromXml(el);

        this.mfrImageSquare = el.hasAttribute('mfr_image_square') ? el.getAttribute('mfr_image_square') : '';
        this.mfrImageTiny = el.hasAttribute('mfr_image_tiny') ? el.getAttribute('mfr_image_tiny') : '';
        this.canHandleSleeves = el.hasAttribute('can_handle_sleeves') ? (el.getAttribute('can_handle_sleeves') === '1' ? true : false) : false;
        this.enableTeamNameNumbers = el.hasAttribute('enable_team_name_numbers') ? (el.getAttribute('enable_team_name_numbers') === '1' ? true : false) : false;
        this.hasBack = el.hasAttribute('has_back') ? (el.getAttribute('has_back') === '1' ? true : false) : false;
        this.hasThirdSide = el.hasAttribute('has_third_side') ? (el.getAttribute('has_third_side') === '1' ? true : false) : false;
        this.hasFourthSide = el.hasAttribute('has_fourth_side') ? (el.getAttribute('has_fourth_side') === '1' ? true : false) : false;
        this.thirdSideName = el.hasAttribute('third_side_name') ? el.getAttribute('third_side_name') : '';
        this.fourthSideName = el.hasAttribute('fourth_side_name') ? el.getAttribute('fourth_side_name') : '';
        this.productType = el.hasAttribute('product_type') ? el.getAttribute('product_type') : '';
        this.includeGrommets = el.hasAttribute('include_grommets') ? (el.getAttribute('include_grommets') === '1' ? true : false) : false;
        this.longDescription = el.hasAttribute('long_description') ? el.getAttribute('long_description') : '';

        this.mfrImageSquare = this.mfrImageSquare.replace('REPLACE_DOMAIN_WITH', 'http://stores.inksoft.com');
        this.mfrImageTiny = this.mfrImageTiny.replace('REPLACE_DOMAIN_WITH', 'http://stores.inksoft.com');

        this.styles = Array.prototype.slice.call(el.children).filter((node:Element)=> { return node.tagName === 'product_styles'}).map((node:Element) => {
            const style = new ProductStyle();
            style.fromXml(node);
            return style;
        })
    }

}

export class ProductStyle {
    
    productStyleId:string;
    isDefault:boolean;
    color:string;
    htmlColor:string;
    imageFilePathFront:string;
    imageFilePathBack:string;
    imageFilePathSleeveLeft:string;
    imageFilePathSleeveRight:string;
    htmlColor2:string;
    customizable:boolean;
    canPrint:boolean;
    canDigitalPrint:boolean;
    canScreenPrint:boolean;
    canEmbroider:boolean;
    unitPrice:number;
    namePrice:string;
    numberPrice:string;
    sizes:StyleSize[];
    imageHeightFront:number;
    imageHeightBack:number;

    fromXml(el:Element) {
        
        this.productStyleId = el.hasAttribute('product_style_id') ? el.getAttribute('product_style_id') : '';
        this.isDefault = el.hasAttribute('is_default') ? (el.getAttribute('is_default') === '1' ? true : false) : false;
        this.color = el.hasAttribute('color') ? el.getAttribute('color') : '';
        this.htmlColor = el.hasAttribute('html_color') ? el.getAttribute('html_color') : '';
        this.imageFilePathFront = el.hasAttribute('image_file_path_front') ? 'https://images.inksoft.com' + el.getAttribute('image_file_path_front') : '';
        this.imageFilePathBack = el.hasAttribute('image_file_path_back') ? 'https://images.inksoft.com' + el.getAttribute('image_file_path_back') : '';
        this.imageFilePathSleeveLeft = el.hasAttribute('image_file_path_sleeve_left') ? 'https://images.inksoft.com' + el.getAttribute('image_file_path_sleeve_left') : '';
        this.imageFilePathSleeveRight = el.hasAttribute('image_file_path_sleeve_right') ? 'https://images.inksoft.com' + el.getAttribute('image_file_path_sleeve_right') : '';
        
        //Create sizes
        if(el.hasAttribute('sizes')) {
            const sizes = el.getAttribute('sizes').split(',');
            const sizeids = el.hasAttribute('sizeids') ? el.getAttribute('sizeids').split(',') : [];
            const upcharges = el.hasAttribute('upcharges') ? el.getAttribute('upcharges').split(',') : [];
            this.sizes = sizes.map((s:string, index:number) => {
                const ss = new StyleSize(s, 
                    index < sizeids.length ? sizeids[index]:'', 
                    index < upcharges.length ? parseFloat(upcharges[index]) : 0);
                
                return ss;
            })
        }
    }
}

export class StyleSize {
    name:string;
    id:string;
    upcharge:number;

    constructor(name:string, id:string, upcharge:number) {
        this.name = name;
        this.id = id;
        this.upcharge = upcharge;
    }
    
}