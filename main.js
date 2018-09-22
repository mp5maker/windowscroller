(function(){
    "use strict";

    angular.module('scroller', [])
    .controller('mainCtrl', function($scope, $http){
        $scope.currentPage = 0;

        /**
         * Fatch Data from Rest API
         */
        $scope.getData = function () {
            $scope.currentPage += 1;
            var url = "https://jsonplaceholder.typicode.com/photos?_page=1&_limit=" + (20 * $scope.currentPage);
            $http.get(url).then(function (response) {
                $scope.photos = response.data;
                $scope.nearBottom = true;
            });
        };

        /**
         * Get Data
         */
        $scope.getData();

        /**
         * Document Height 
         */
        $scope.documentHeight = function () {
            var body = document.body;
            var html = document.documentElement;
            var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            return parseInt(height);
        }

        /**
         * Scroll Top
         */
        $scope.scrollTop = function () {
            var supportPageOffset = window.pageXOffset !== undefined;
            var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
            var scrollingTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
            return parseInt(scrollingTop);
        }

        /**
         * Window Height
         */
        $scope.windowHeight = function () {
            return parseInt(window.innerHeight);
        }

        /**
         * Listen to the scroll
         */
        window.addEventListener('scroll', 
            function() {
                console.log("%c Document Height: " + $scope.documentHeight(), "background-color: silver; color: black");
                console.log("%c Window Height: " + ($scope.windowHeight() + $scope.scrollTop()), "background-color: black; color: white");
                /**
                 * Checks whether the window height is nearby the document height
                 */
                if(($scope.windowHeight() + $scope.scrollTop()) > ($scope.documentHeight() - 200)) {
                    console.log("%c Nearby Bottom: " + ($scope.windowHeight() + $scope.scrollTop()), "background-color: firebrick; color: white");
                    $scope.getData();
                }else {
                    $scope.nearBottom = false;
                }
                
                /**
                 * Checks whether the window height is exactly the document height
                 */
                if($scope.windowHeight() + $scope.scrollTop() == $scope.documentHeight()) {
                    console.log("%c Bottom Reached: " + ($scope.windowHeight() + $scope.scrollTop()), "background-color: indigo; color: white");
                    $scope.bottom = true;
                } else {
                    $scope.bottom = false;
                }
            }
        );

        /**
         * Window Height greater than document height - 100 
         * Set nearBottom to true
         */
        if($scope.windowHeight() + $scope.scrollTop() > $scope.documentHeight() - 100) {
            $scope.nearBottom = true;
        }else {
            $scope.nearBottom = false;
        }

        /**
         * If the document is nearby the end of the document add more page 
         */
        $scope.$watch('nearBottom', function(newvalue, oldvalue) {
            if(newvalue && !oldvalue) {
                $scope.getData();
            }
        });
    })
    .directive('windowScroller', function($window, $interval){
        return {
            templateUrl: "window-scroller.html",
            controller: function($scope) {
                $scope.isClicked = false;

                $scope.scrollerClick = function() {
                    $scope.isClicked =! $scope.isClicked;
                    if($scope.isClicked) {
                        $scope.addStyle();
                        $scope.scrollToBottom();
                        $scope.windowBinder();
                        $scope.interval = $interval(function(){
                            window.scrollBy(0, 1000);
                        }, 1000);
                    }else {
                        $scope.removeStyle();
                        angular.element($window).off('scroll');
                        $interval.cancel($scope.interval);
                    }
                };

                $scope.$watch('nearBottom', function(newvalue, oldvalue) {
                    console.log("Near Bottom");
                    if(newvalue && !oldvalue && $scope.isClicked) {
                        $scope.scrollToBottom();
                        $scope.windowBinder();
                    } 
                });

                $scope.addStyle = function() {
                    angular.element('#window-scroller')[0].classList.add('window-scroller-activated');
                };

                $scope.removeStyle = function() {
                    angular.element('#window-scroller')[0].classList.remove('window-scroller-activated');
                };

                $scope.scrollToBottom = function() {
                    $("html, body").animate({ 
                            scrollTop: $scope.documentHeight() + $scope.documentHeight()
                        }, "slow");
                }

                $scope.windowBinder = function() {
                    angular.element($window).off().on("scroll", _.throttle(
                        function () {
                            if (($scope.windowHeight() + $scope.scrollTop()) > ($scope.documentHeight() - 200)) {
                                $scope.scrollToBottom();
                            }
                        }, 1000)
                    );
                }
            }
        }
    });
})();
