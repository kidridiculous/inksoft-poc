export class ProductCategory {
    name: string;
    id: string;
    path: string;
    parentId: string;
    thumbUrlFront: string;
    children: ProductCategory[] = [];

    fromXml(el:Element) {
        this.id = el.getAttribute('product_category_id');
        this.name = el.getAttribute('name');
        this.path = el.getAttribute('path');
        this.thumbUrlFront = el.getAttribute('thumburl_front');
        this.parentId = el.hasAttribute('parent_id') ? el.getAttribute('parent_id') : '';
    }

    addChild(child:ProductCategory) {
        this.children.push(child);
    }
}