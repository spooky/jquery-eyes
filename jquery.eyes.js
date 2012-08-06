(function ($) {

    $.fn.eyes = function (customOptions) {
        var options = $.extend({}, $.fn.eyes.defaultOptions, customOptions),
            mouseCoords = [0,0];

        function _checkPoitPreconditions() {
            for(var i in arguments) {
                if (arguments[i].length != 2) throw 'Invalid input';
            }
        };

        // a[x1, y1], b[x1,y2]
        function _slope(a, b) {
            _checkPoitPreconditions(a,b);
            return a[0] == b[0] ? 0 : (a[1] - b[1]) / (a[0] - b[0]);
        };

        // a[x1, y1], b[x1,y2]
        function _yIntercept(a, b) {
            _checkPoitPreconditions(a,b);
            return a[0] == b[0] ? a[1] : a[1] - a[0] * ((a[1] - b[1]) / (a[0] - b[0]));
        };

        function _getIntersectionPoint(slope1, yIntercept1, slope2, yIntercept2) {
            if (slope1 == slope2) return null; // none or infinite intersection points

            var x = (yIntercept2 - yIntercept1) / (slope1 - slope2),
                y = slope1 * (x) + yIntercept1;

            return [x, y];
        }

        function _isPointInSection(point, sec1, sec2) {
            _checkPoitPreconditions(point, sec1, sec2);
            // assuming that point is an intersection point (lies on the line) comparing coords is enough to check if point is on the section
            return point[0] <= Math.max(sec1[0], sec2[0]) && point[0] >= Math.min(sec1[0], sec2[0])
                && point[1] <= Math.max(sec1[1], sec2[1]) && point[1] >= Math.min(sec1[1], sec2[1]);
        };

        function _dist(p1, p2) {
            _checkPoitPreconditions(p1, p2);
            return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
        };

        function _draw(point) {
            var canvas = $('#debug');
            var ctx = canvas[0].getContext('2d');
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(point[0],point[1],3,0,Math.PI*2,true);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        };

        function _drawLine(point, point2) {
            var canvas = $('#debug');
            var ctx = canvas[0].getContext('2d');
            ctx.fillStyle = '#00FF00';
            ctx.moveTo(point[0], point[1]);
            ctx.lineTo(point2[0], point2[1]);
            ctx.stroke();
        };

        // keep point within options.shape bounds
        function _contain(x, y) {
            var bounds = options.shape,
                center = options.center,
                current = null,
                matching = [];

            for (var i=0; i<bounds.length; i++) {
                // calculate line eqation params for [eye center, mouse pos] (y = ax + b)
                var a1 = _slope(center, mouseCoords),
                    b1 = _yIntercept(center, mouseCoords),
                    a2 = _slope(bounds[i], bounds[(i+1) % bounds.length]),
                    b2 = _yIntercept(bounds[i], bounds[(i+1) % bounds.length]);

                // check intersection point between [eye center, mouse pos] and bounds
                // _draw(center);
                // _drawLine(bounds[i], bounds[(i+1) % bounds.length]);
                current = _getIntersectionPoint(a1, b1, a2, b2);
                if (current != null && _isPointInSection(current, bounds[i], bounds[(i+1) % bounds.length])) {
                    // _draw(current);
                    matching.push(current);
                }
            }

            // get closest to cursor
            var closest, minDist = Infinity, currDist = Infinity;
            for (var i in matching) {
                currDist = _dist(matching[i], mouseCoords);
                if (currDist < minDist) {
                    minDist = currDist;
                    closest = matching[i];
                }
            }

            return closest || [];
        };

        function _follow(x, y) {            
            var pos = options.pic.offset();
            mouseCoords = [Math.round(x - pos.left), Math.round(y - pos.top)];

            $('#mouse-debug').text(mouseCoords);

            var pupilPos = _contain(mouseCoords[0], mouseCoords[1]);
            options.pupil.css({ left: pupilPos[0], top: pupilPos[1] });
        };

        function _trackMouse(e) {
            _follow(e.pageX, e.pageY);
        };

        function _init(matchedObj) {
            if (options.shape == null) throw 'Eye shape not initialized';
            if (options.center == null) throw 'Eye center not initialized';
            if (options.pupil == null) throw 'Eye pupil not initialized';

            options.pupil = $(options.pupil); // make sure we always end up with jQuery object in here 
            options.pic = options.pic == null ? options.pupil.parent() : $(options.pic);

            $(document).mousemove(_trackMouse);
        };

        return this.each(function () {
            var $this = $(this);
            _init($this);
        });
    };

    $.fn.eyes.defaultOptions = {
        shape: null,
        center: null,
        pupil: null,
        pic: null,
    };

})(jQuery);