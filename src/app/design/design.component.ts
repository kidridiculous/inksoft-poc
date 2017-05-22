import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';
import { InkSoftService } from '../inksoft/inksoft.service';
import { ProductCategory } from '../inksoft/product-category';
import { Product } from '../inksoft/product';

@Component({
  templateUrl: './design.component.html',
  providers: [InkSoftService]
})

export class DesignComponent implements OnInit { 

        
    productId:string;
    productStyleId:string;

    constructor(private inkSoftService: InkSoftService,
        private route: ActivatedRoute,
        private location: Location) {
            this.productId = '';
            this.productStyleId = '';

         }

    ngOnInit():void {

        
        
        /*
        this.inkSoftService.getCategories().then((categories) => {
            this.categories = categories;
        });
        */

        this.route.params.subscribe((params) => {
            this.productId = params['productId'];
            this.productStyleId = params['productStyleId'];

            this._window().launchDesigner('HTML5DS', this.getInitParams(this.productId, this.productStyleId), document.getElementById("embeddedDesigner"));

        });
        
    }

    _window():any {
        return window;
    }

    getInitParams(productId:string, productStyleId:string):any {
        return {
            DesignerLocation: "https://images.inksoft.com/designer/html5",
            EnforceBoundaries: "1",
            Background: "",
            VectorOnly: false,
            DigitalPrint: true,
            ScreenPrint: true,
            Embroidery: false,
            MaxScreenPrintColors: "12",
            RoundPrices: false,
            StoreID: "15975",
            PublisherID: "3414",
            SessionID: "",
            SessionToken: "",
            CartRetailItemID: "",
            UserID: "",
            UserName: "",
            UserEmail: "",
            DesignID: "",
            DefaultProductID: "1000000",
            DefaultProductStyleID: "1000043",
            ProductID: productId,
            ProductStyleID: productStyleId,
            ProductCategoryID: "",
            ClipArtGalleryID: "",
            DisableAddToCart: false,
            DisableUploadImage: false,
            DisableClipArt: false,
            DisableUserArt: false,
            DisableProducts: true,
            DisableDesigns: false,
            DisableDistress: false,
            DisableResolutionMeter: true,
            DisableUploadVectorArt: false,
            DisableUploadRasterArt: false,
            StartPage: "",
            StartPageCategoryID: "",
            StartPageHTML: "",
            StartBanner: "",
            OrderID: "",
            CartID: "",
            ArtID: "",
            FontID: "",
            Domain: "stores.inksoft.com",
            SSLEnabled: true,
            SSLDomain: "stores.inksoft.com",
            StoreURI: "Winning_Team_Tees",
            Admin: "",
            NextURL: "",
            CartURL: "https://stores.inksoft.com/Winning_Team_Tees/Cart",
            OrderSummary: true,
            VideoLink: "http://www.youtube.com/watch?v=EfXICdRwt4E",
            Phone: "770-297-9120",
            WelcomeScreen: "",
            ContactUsLink: "/Winning_Team_Tees/Stores/Contact",
            WelcomeVideo: "",
            GreetBoxSetting: "LANDING",
            HelpVideoOverview: "",
            AutoZoom: false,
            EnableNameNumbers: true,
            AddThisPublisherId: "xa-4fccb0966fef0ba7",
            EnableCartPricing: true,
            EnableCartCheckout: false,
            EnableCartBilling: false,
            EnableCartShipping: true,
            PaymentDisabled: false,
            PaymentRequired: true,
            BillingAddressRequired: true,
            PasswordLength: "4",
            DefaultCountryCode: "US",
            CurrencyCode: "USD",
            CurrencySymbol: "$",
            HideProductPricing: false,
            PB: true,
            HideClipArtNames: true,
            HideDesignNames: true,
            ThemeName: "flat",
            FullScreen: false,
            Version: "3.1.0",
            BackgroundColor: "",
            StoreLogo: "//stores.inksoft.com/images/publishers/3414/stores/Winning_Team_Tees/img/logo.png",
            StoreName: "All Sports Uniforms",
            StoreEmail: "paul@allsportsuniforms.net",
            EnableEZD: false,
            EmbedType: "iframe"};
    }
}