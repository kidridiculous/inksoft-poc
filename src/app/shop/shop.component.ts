import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';
import { InkSoftService } from '../inksoft/inksoft.service';
import { ProductCategory } from '../inksoft/product-category';
import { Product } from '../inksoft/product';

@Component({
  templateUrl: './shop.component.html',
  providers: [InkSoftService]
})

export class ShopComponent implements OnInit { 

    categories:ProductCategory[];
    products:Product[];
    categoryId:string = '';
    selectedCategory:ProductCategory;

    constructor(private inkSoftService: InkSoftService,
        private route: ActivatedRoute,
        private location: Location) { }

    ngOnInit():void {
        
        this.inkSoftService.getCategories().then((categories) => {
            this.categories = categories;

            this.setSelectedCategory();
        });

        this.route.params.subscribe((params) => {
            this.categoryId = params['id'];

            this.setSelectedCategory();
            
            this.inkSoftService.getProductsByCategory(this.categoryId, '', false).then((products) => {
                this.products = products;
            });


        });
    }

    setSelectedCategory():void {
        if(this.categoryId === '' || !Array.isArray(this.categories)) return;

        this.selectedCategory = this.categories.find((cat)=>{
            return cat.id === this.categoryId;
        });

        if(!this.selectedCategory) {
            this.categories.forEach((topCat) => {
                if(Array.isArray(topCat.children)) {
                    if(topCat.children.some((childCat) => {return childCat.id === this.categoryId;})) {
                        this.selectedCategory = topCat;
                    }
                }
            });
        }
    }

}