'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularApp
 */
angular.module('angularApp')
    .controller('MainCtrl', ['Meet', '$timeout', '$q', '$log', '$rootScope', '$sce', '$scope', '$interval', function (Meet, $timeout, $q, $log, $rootScope, $sce, $scope, $interval) {
        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        var _this = this;
        var rtc = new ZjRTC(); //
        rtc.clayout = "4:4";
        rtc.onSetup = function (stream, pinStatus, conferenceExtension) {
            $timeout(function () {
                $log.debug('ZjRTC.onSetup', stream, pinStatus, conferenceExtension);
                if (stream) {
                    $('#lvideo')[0].srcObject = stream;
                }

                if (!stream && conferenceExtension) {
                    $rootScope.$broadcast('call::extensionRequested', conferenceExtension);
                } else if (pinStatus !== 'none') {
                    $rootScope.$broadcast('call::pinRequested', pinStatus === 'required');
                } else {
                    _this.connect();
                }
            });
        };

        this.connect = function (pin, extension) {
            rtc.connect(pin, extension);
        };

        rtc.onConnect = function (stream) {
            if (rtc.call_type === 'video' || rtc.call_type == 'recvonly') {
                $('#rvideo')[0].srcObject = stream;
                $('#raudio')[0].srcObject = stream;
            }
        };


        var apiServer = 'bss.lalonline.cn',
            mcuHost = '',
            alias = '7996',
            password = '224466',
            displayName = 'demo1';
        var data = {
            joinAccount: alias,
            joinPwd: password,
            participantName: displayName
        }

        // get conference information
        Meet.getAuth(apiServer, data).$promise.then(function (res) {
            if (res.code === '200') {
                mcuHost = res.results.mcuHost;
                rtc.pin = password
            }
            else
                alert(res.results);
        })
            .catch(function (err) {
                alert(`????????????????????????????????????????????????:${err.config.url}???`);
            })

        // click enter to conference
        $scope.enterConference = function () {
            rtc.makeCall(mcuHost, alias, displayName, null, 'video');
        }
        $scope.exitConference = function () {
            rtc.disconnect();
        }

        //????????????
        $scope.screenShare = function () {
            rtc.present('screen');
        }
        $scope.exitScreenShare = function () {
            rtc.present(null);
        }
        rtc.onScreenshareStopped = function (msg) {
            console.log('onScreenshareStopped: ', msg);
        }
        rtc.onScreenshareMissing = function (msg) {
            var message = '???????????????????????????????????? "https".\n ??????????????????????????????????????????:\n https://cs.zijingcloud.com/static/extension/browser.html';
            alert(message);
            console.log(message);
        }

        //sdk ??????????????????
        rtc.onError = function (msg) {

            console.log('onError: ', msg);
        }
        window.onbeforeunload = function () {
            rtc.disconnect();
        }
    }]);