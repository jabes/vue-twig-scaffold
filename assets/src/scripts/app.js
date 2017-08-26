const vm = new Vue({

    el: '#app',

    methods: {

        reloadPage(params) {
            const loc = window.location;
            const query = vm.serialize(params);
            window.location.href = loc.origin + loc.pathname + '?' + query;
        },

        getQueryParams() {
            let search = location.search.substring(1);
            search = decodeURI(search)
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"');
            return search ? JSON.parse(`{"${search}"}`) : {};
        },

        updateQueryParam(name, value) {
            let params = this.getQueryParams();
            if (value === params[name]) {
                return;
            } else if (value && value !== '') {
                params[name] = value;
            } else {
                delete params[name];
            }
            this.reloadPage(params);
        },

        getParent(element, tagName) {
            let parent = element;
            while (parent.tagName !== tagName) {
                parent = parent.parentElement;
                if (!parent) {
                    break;
                }
            }
            return parent;
        },

        getSibling(element, tagName) {
            let sibling = element;
            while (sibling.tagName !== tagName) {
                sibling = sibling.nextSibling;
                if (!sibling) {
                    break;
                }
            }
            return sibling;
        },

        serialize(obj) {
            let str = [];
            for (let p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join("&");
        },

        request(url, method = 'POST', data = null, cb = null) {
            const xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                    if (xmlhttp.status === 200) {
                        if (cb && xmlhttp.response) {
                            const data = JSON.parse(xmlhttp.response);
                            cb(data);
                        }
                    } else {
                        console.error(xmlhttp);
                    }
                }
            };
            if (method === 'GET') {
                url = url + '?' + this.serialize(data);
            }
            xmlhttp.open(method, url, true);
            xmlhttp.send(data);
        },

        submitAjaxForm(event, cb = null) {
            const form = event.target;
            const formData = new FormData(form);
            this.request(
                form.getAttribute('action'),
                form.getAttribute('method'),
                formData,
                (data) => {
                    if (cb) {
                        cb(form, data);
                    }
                }
            );
        },

        submitForm(event) {
            const form = this.getParent(event.target, 'FORM');
            const inputs = form.querySelectorAll('[value=""]');
            for (let input of inputs) {
                input.disabled = true;
            }
            form.submit();
        },

        triggerEvent(element, type) {
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent(type, false, true);
            element.dispatchEvent(evt);
        },

        parseFloat(string) {
            let num = string.replace(/[^0-9.]/g, '');
            num = parseFloat(num);
            if (isNaN(num)) {
                num = 0;
            }
            return num;
        },

        getCurrencyFormat(num) {
            const options = {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            };
            return '$' + Number(num).toLocaleString(undefined, options);
        },

        easeInOut(currentTime, start, change, duration) {
            currentTime /= duration / 2;
            if (currentTime < 1) return change / 2 * currentTime * currentTime + start;
            currentTime -= 1;
            return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
        },

        stopAnimateScroll() {
            window.removeEventListener('wheel', this.stopAnimateScroll);
            if (this.animateScrollInstance) {
                clearTimeout(this.animateScrollInstance);
                delete this.animateScrollInstance;
                this.waitForScrollFinish = false;
            }
        },

        scrollTo(element, to, duration) {
            const start = element.scrollTop;
            const change = to - start;
            const increment = 10;
            const animateScroll = (elapsedTime) => {
                elapsedTime += increment;
                element.scrollTop = this.easeInOut(elapsedTime, start, change, duration);
                if (elapsedTime < duration) {
                    this.animateScrollInstance = setTimeout(() => {
                        animateScroll(elapsedTime);
                    }, increment);
                } else {
                    this.stopAnimateScroll();
                }
            };
            // remove any existing animations before we start
            this.stopAnimateScroll();
            // cancel animation if the user initiates a mouse wheel event
            window.addEventListener('wheel', this.stopAnimateScroll);
            // begin the animation loop
            animateScroll(0);
        },

        scrollToTop() {
            this.scrollTo(document.body, 0, 1500);
        },

        isElementInView(element) {
            const rect = element.getBoundingClientRect();
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            return {
                // Returns true so long as some of the element is within the viewport
                partial: (
                    (rect.top + rect.height) >= 0 && // bottom
                    (rect.left + rect.width) >= 0 && // right
                    (rect.bottom - rect.height) <= windowHeight && // top
                    (rect.right - rect.width) <= windowWidth // left
                ),
                // Returns true only if all of the element is within the viewport
                complete: (
                    rect.top >= 0 && // bottom
                    rect.left >= 0 && // right
                    rect.bottom <= windowHeight && // top
                    rect.right <= windowWidth // left
                ),
            };
        },

        touchCoords(event) {
            const touchEvents = ['touchmove', 'touchstart', 'touchend'];
            const isTouchEvent = touchEvents.indexOf(event.type) > -1;
            if (isTouchEvent) {
                let touch = event.targetTouches[0] || event.changedTouches[0];
                return {
                    x: touch.clientX,
                    y: touch.clientY,
                };
            } else {
                return {
                    x: event.clientX,
                    y: event.clientY,
                };
            }
        },

        prefixed(style, property) {
            const prefixes = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
            let camelProp = property[0].toUpperCase() + property.slice(1);
            for (let i = 0; i < prefixes.length; i++) {
                let prefix = prefixes[i];
                let prop = prefix ? prefix + camelProp : property;
                if (prop in style) {
                    return prop;
                }
                i++;
            }
            return undefined;
        },

        getStyle(element, property) {
            const style = element.style;
            const prefixed = this.prefixed(style, property);
            return style[prefixed];
        },

        setStyle(element, property, value) {
            const style = element.style;
            const prefixed = this.prefixed(style, property);
            return style[prefixed] = value;
        },

    },

});
