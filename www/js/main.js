var app = angular.module('BeaconProject', ['onsen']);

var deviceUUid = 12345;

app.service('iBeaconService', function() {
    this.currentIdentifier  = null; //  監視対象のビーコンID
    this.onDetectCallback   = function() {};
        
        
    //  ビーコンの情報（配列）
    var beacons = {
        "tkd-i-001": {
            name:'tkd-i-001', 
            uuid:'48534442-4C45-4144-80C0-180000000000', 
            major:200, 
            minor:1, 
            icon:'icon/1.jpg', 
        　　//url:'http://snowsss.php.xdomain.jp/insert.php',
            url:'info-page3.html',
            rssi:-63, 
            proximity:'Unknown',
        },
        "tkd-i-002": {  
            name:'tkd-i-002', 
            uuid:'48534442-4C45-4144-80C0-180000000000', 
            major:1, 
            minor:1, 
            icon:'icon/2.jpg', 
            url:'info-page4.html',
            rssi:-63, 
            proximity:'Unknown',
        },
        "tkd-i-003": {
            name:'tkd-i-003', 
            uuid:'48534442-4C45-4144-80C0-180000000000', 
            major:200, 
            minor:2, 
            icon:'icon/3.jpg', 
            url:'info-page1.html',
            rssi:-63, 
            proximity:'Unknown',
        },
        "tkd-i-004": {
            name:'tkd-i-004', 
            uuid:'48534442-4C45-4144-80C0-180000000000', 
            major:200, 
            minor:3, 
            icon:'icon/4.jpg', 
            url:'info-page2.html',
            rssi:-63, 
            proximity:'Unknown',
        }
    };
    this.beacons = beacons;
        
    //  ビーコン登録
    createBeacons = function() {
        var result = [];
        try {
            angular.forEach(beacons, function(value) {
                //  ビーコンの情報（配列）を基にビーコンを登録する。
                result.push(new cordova.plugins.locationManager.BeaconRegion(value.name, value.uuid, value.major, value.minor));
            });
        }
        catch(e) {
            alert('createBeacon error: '+e);
        }
        return result;
    };
    
    //  ビーコン監視
    this.watchBeacons = function(callback) {
        document.addEventListener("deviceready", function() {

            deviceUUid = device.uuid;

            var beacons = createBeacons();  //  ビーコン登録へ
            try {
                var delegate = new cordova.plugins.locationManager.Delegate();
                
                //  領域内のビーコンの状態を決定するとき
                delegate.didDetermineStateForRegion = function(pluginResult) {
                    log('[DOM] didDetermineStateForRegion: '+JSON.stringify(pluginResult));
                };
                
                //  領域内のビーコンの監視を開始したとき
                delegate.didStartMonitoringForRegion = function(pluginResult) {
                    log('[DOM] didStartMonitoringForRegion: '+JSON.stringify(pluginResult));
                };
                
                //  領域内のビーコンを受信したとき
                delegate.didRangeBeaconsInRegion = function(pluginResult) {
                    var beaconData  = pluginResult.beacons[0];
                    var uuid        = pluginResult.region.uuid.toUpperCase();
                    var identifier  = pluginResult.region.identifier;
                    if(!beaconData || !uuid) {
                        return;
                    }
                    callback(beaconData, identifier);
                };
                
                window.locationManager = cordova.plugins.locationManager;
                
                locationManager.setDelegate(delegate);
                
                //  iOS関係？
                // required in iOS 8+（iOS8以上なら下の文にする）
                locationManager.requestWhenInUseAuthorization();
                // cordova.plugins.locationManager.requestAlwaysAuthorization();
                
                //  
                beacons.forEach(function(beacon) {
                    locationManager.startRangingBeaconsInRegion(beacon);
                });
            }
            catch(e) {
                alert('delegate error: '+e);
            }
        }, false);
    };
});

//  「top-page」の制御
app.controller('TopPageCtrl', ['$scope', 'iBeaconService', function($scope, iBeaconService) {
    $scope.beacons = iBeaconService.beacons;
    
    //var testUrl = 'http://snowsss.php.xdomain.jp/test11.php';
    
    var callback = function(deviceData, identifier){
        var beacon = $scope.beacons[identifier];
        $scope.$apply(function() {
            beacon.rssi = deviceData.rssi;
            //  ビーコンがかなり近い(rssiが-60以上)のとき
            if(beacon.rssi > -60) {
                beacon.proximity = 'Immediate';
                //  新しいビーコンの領域に入ったとき
                if(iBeaconService.currentIdentifier == null) {
                    navigator.vibrate([1000]);  //  バイブレータ1秒起動
                    $scope.enterInfoPage(identifier);  //   「ページ切り替え」へ                  
                }
            }
            //  ビーコンがまあまあ近い(rssiが-65以上)のとき
            else if(beacon.rssi > -65) {
                beacon.proximity = 'Near';
            }
            //  ビーコンが遠い(rssiが-70以上)とき
            else if(beacon.rssi > -70) {
                beacon.proximity = 'Far';
                //  現在監視しているビーコンを監視対象から外す
                if(iBeaconService.currentIdentifier == identifier) {
                    iBeaconService.currentIdentifier = null;
                    //ビーコンのセンサー範囲から出ると飛ぶページ
                    $scope.beaconNavigator.pushPage('index.html');
                }
            }
            else {
                beacon.proximity = 'Unknown';
            }
        });
    };
    iBeaconService.watchBeacons(callback);

    //var win = null;

    //  ページ切り替え
    $scope.enterInfoPage = function(identifier) {
        iBeaconService.currentIdentifier = identifier;
        /*
        // tkd-i-001ビーコンのみ
        if(iBeaconService.beacons[iBeaconService.currentIdentifier].minor < 2) {
            if(win == null || win.closed) {
                var url = iBeaconService.beacons[iBeaconService.currentIdentifier].url;
            //    var param1 = "?beacon="+iBeaconService.beacons[iBeaconService.currentIdentifier].minor;
            //    var param2 = "&device="+deviceUUid;
            //    win = window.open(url+param1+param2, "GoogleWindow", "resizable=no,scrollbars=yes,status=yes");
                win = window.open(url, "GoogleWindow", "resizable=no,scrollbars=yes,status=yes");
            }
            else {
                win.close();
            }
        }
        */
        //else {
            $scope.beaconNavigator.pushPage(iBeaconService.beacons[iBeaconService.currentIdentifier].url);
            $scope.beaconNavigator.on('prepop', function() {
                iBeaconService.currentIdentifier = null;
            });
        //}
    };
}]);

//  「info-page」ページの制御
app.controller('InfoPageCtrl', ['$scope', 'iBeaconService', function($scope, iBeaconService) {
    $scope.beacon = iBeaconService.beacons[iBeaconService.currentIdentifier];
}]);