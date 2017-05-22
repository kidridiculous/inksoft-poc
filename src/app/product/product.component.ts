import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';
import { Location }                 from '@angular/common';
import { InkSoftService } from '../inksoft/inksoft.service';
import { ProductCategory } from '../inksoft/product-category';
import { ProductDetail, ProductStyle, StyleSize } from '../inksoft/product-detail';

@Component({
  templateUrl: './product.component.html',
  providers: [InkSoftService]
})
export class ProductComponent implements OnInit { 

    product:ProductDetail;
    selectedStyle:ProductStyle;
    selectedSize:StyleSize;
    productId:string;
    productLoaded:Boolean=false;

    constructor(private inkSoftService: InkSoftService,
        private route: ActivatedRoute,
        private location: Location,
        private router: Router) {
            this.product = new ProductDetail();
            this.selectedStyle = new ProductStyle();
            this.selectedSize = null;
         }

    ngOnInit():void {
        
        /*
        this.inkSoftService.getCategories().then((categories) => {
            this.categories = categories;
        });
        */
        this.route.params.subscribe((params) => {
            this.productId = params['id'];

            this.inkSoftService.getProduct(this.productId).then((product) => {
                this.product = product;
                this.selectedStyle = this.product.styles.find((style) => {
                    return style.isDefault;
                });
                this.productLoaded = true;

            });
        });
        
    }

    selectStyle(color:string) {
        this.selectedStyle = this.product.styles.find((style) => { return style.color == color; });
    }

    selectSize(size:StyleSize) {
        this.selectedSize = size;
    }

    designSku():void {
        this.router.navigate(['/design', this.productId, this.selectedStyle.productStyleId]);
    }
}