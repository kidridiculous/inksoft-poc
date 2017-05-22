import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ProductCategory } from './product-category';
import { Product } from './product';
import { ProductDetail } from './product-detail';

@Injectable()
export class InkSoftService {

    private domain = 'stores.inksoft.com';
    private storeId = '15975';

    constructor(private http:Http) {

    }

    getCategories():Promise<ProductCategory[]> {

        const url = 'http://' + this.domain + '/GetProductCategoryList/' + this.storeId;

        return this.http.get(url)
            .toPromise()
            .then((res:Response) => {
                const parser:DOMParser = new DOMParser();
                const xmlResults:Document = parser.parseFromString(res.text(),"text/xml");
                const allCategories = Array.prototype.slice.call(xmlResults.getElementsByTagName("vw_product_categories")).map((el:Element) => {
                    const pc = new ProductCategory();
                    pc.id = el.getAttribute('product_category_id');
                    pc.name = el.getAttribute('name');
                    pc.path = el.getAttribute('path');
                    pc.thumbUrlFront = el.getAttribute('thumburl_front');
                    pc.parentId = el.hasAttribute('parent_id') ? el.getAttribute('parent_id') : '';
                    return pc;
                });

                const topCategories = allCategories.filter((cat:ProductCategory) => { return cat.parentId === '';});

                allCategories.forEach((cat:ProductCategory) => {
                    if(cat.parentId !== '') {
                        const parentCat:ProductCategory = topCategories.find((topCat:ProductCategory) => {
                            return cat.parentId === topCat.id;
                        });
                        if(parentCat) {
                            parentCat.addChild(cat);
                        }
                    }
                })
                
                return topCategories;
        }).catch(this.handleError);
        
    }

    getProductsByCategory(category:string, searchTerm:string, includeNonPrintable:boolean):Promise<Product[]>  {
        
        if(category.length===0) category = '0';

        const url = 'http://' + this.domain + '/GetProductList/' + this.storeId + '/' + category + '/' + searchTerm + '/' + (includeNonPrintable ? '1':'0');

        return this.http.get(url)
            .toPromise()
            .then((res:Response) => {
                const parser:DOMParser = new DOMParser();
                const xmlResults:Document = parser.parseFromString(res.text(),"text/xml");
                const products = Array.prototype.slice.call(xmlResults.getElementsByTagName("CS")).map((el:Element) => {
                    const p = new Product();
                    p.fromXml(el);
                    return p;
                });

                return products;
        }).catch(this.handleError);
    }

    getProduct(productId:string):Promise<ProductDetail>  {
        
        const url = 'http://' + this.domain + '/GetProduct/' + this.storeId + '/' + productId;

        return this.http.get(url)
            .toPromise()
            .then((res:Response) => {
                const parser:DOMParser = new DOMParser();
                const xmlResults:Document = parser.parseFromString(res.text(),"text/xml");
                const productEls = xmlResults.getElementsByTagName("products");
                if(productEls.length === 1){
                    const pd = new ProductDetail();
                    pd.fromXml(productEls[0]);
                    return pd;
                }

                return null;
        }).catch(this.handleError);
    }

    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.text() || '';
            errMsg = `${error.status} - ${error.statusText || ''} ${body}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Promise.reject(errMsg);
    }


}