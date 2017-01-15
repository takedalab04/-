// This is a JavaScript file


<ons-navigator var="beaconNavigator">
<ons-page ng-controller="InfoPageCtrl">
    <ons-toolbar>
        <div class="left" onclick="beaconNavigator.pushPage('top-page.html');">
            <ons-back-button>Back</ons-back-button>
        </div>
        <div class="center">
            Mt. Takao Information
        </div>
    </ons-toolbar>
    
    <ons-carousel swipeable overscrollable auto-scroll fullscreen id="image1">
        <ons-carousel-item></ons-carousel-item>
        <ons-carousel-item></ons-carousel-item>
    </ons-carousel>
</ons-page>
</ons-navigator>