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
        };

        /**
         * Scroll Top
         */
        $scope.scrollTop = function () {
            var supportPageOffset = window.pageXOffset !== undefined;
            var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
            var scrollingTop = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
            return parseInt(scrollingTop);
        };

        /**
         * Window Height
         */
        $scope.windowHeight = function () {
            return parseInt(window.innerHeight);
        };

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
         * If the document is nearby the end of the document get more data
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
                /**
                 * Initial State of th ebutton
                 */
                $scope.isClicked = false;
                $scope.scrollType = "down";

                /**
                 * Button Clicked
                 */
                $scope.scrollerClick = function() {
                    if($scope.scrollType == "down") {
                        $scope.isClicked =! $scope.isClicked;
                        if($scope.isClicked) {
                            $scope.addStyle();
                            $scope.scrollToBottom();
                            $scope.windowBinder();
                            /**
                             * Check to go to bottom
                             */
                            $scope.interval = $interval(function(){
                                window.scrollBy(0, $scope.documentHeight() + $scope.documentHeight());
                            }, 5000);
                        }else {
                            $scope.removeStyle();
                            angular.element($window).off('scroll');
                            $interval.cancel($scope.interval);
                            $scope.addUpStyle();
                            $scope.scrollType = "up";
                        }
                    } else if($scope.scrollType == "up") {
                        $scope.scrollUp();
                        $scope.removeAddUpStyle();
                        $scope.scrollType = "down";
                    }
                };

                /**
                 * Near By Bottom
                 */
                $scope.$watch('nearBottom', function(newvalue, oldvalue) {
                    console.log("Near Bottom");
                    if(newvalue && !oldvalue && $scope.isClicked) {
                        $scope.scrollToBottom();
                        $scope.windowBinder();
                    } 
                });

                /**
                 * Add Style when scrolling is on
                 */
                $scope.addStyle = function() {
                    angular.element('#window-scroller')[0].classList.add('window-scroller-activated');
                };

                /**
                 * Remvove Style when scrolling is off
                 */
                $scope.removeStyle = function() {
                    angular.element('#window-scroller')[0].classList.remove('window-scroller-activated');
                };

                /**
                 * Scrolls to the bottom
                 */
                $scope.scrollToBottom = function() {
                    $("html, body").animate({ 
                        scrollTop: ($scope.documentHeight() + $scope.documentHeight())
                    }, "slow");
                };

                /**
                 * Extra binding to the window to check the window and document height to go to bottom 
                 */
                $scope.windowBinder = function() {
                    angular.element($window).off().on("scroll", _.throttle(
                        function () {
                            if (($scope.windowHeight() + $scope.scrollTop()) > ($scope.documentHeight() - 200)) {
                                $scope.scrollToBottom();
                            }
                        }, 1000)
                    );
                };

                /**
                 * Add a Chevron Up Icon
                 */
                $scope.addUpStyle = function() {
                    angular.element('#window-scroller')[0].classList.remove('fa-chevron-down');
                    angular.element('#window-scroller')[0].classList.add('fa-chevron-up');
                }

                /**
                 * Scroll Up
                 */
                $scope.scrollUp = function () {
                    $("html, body").animate({
                        scrollTop: 0
                    }, "slow");
                };

                /**
                 * Replace the Chevron Up with Chevron Down
                 */
                $scope.removeAddUpStyle = function() {
                    angular.element('#window-scroller')[0].classList.remove('fa-chevron-up');
                    angular.element('#window-scroller')[0].classList.add('fa-chevron-down');
                }
            }
        };
    });
})();
