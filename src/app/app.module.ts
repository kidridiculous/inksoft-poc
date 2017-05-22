import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop/shop.component';
import { ProductComponent } from './product/product.component';
import { DesignComponent } from './design/design.component';
import { PageNotFoundComponent } from './not-found.component';



const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'shop/:id', component: ShopComponent },
  { path: 'product/:id', component: ProductComponent },
  { path: 'design', component: DesignComponent },
  { path: 'design/:productId/:productStyleId', component: DesignComponent },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ShopComponent,
    ProductComponent,
    DesignComponent,
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
