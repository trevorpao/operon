/*! Validatr - v0.5.1 - 2013-03-12
 * http://jaymorrow.github.com/validatr/
 * Copyright (c) 2013 Jay Morrow; Licensed MIT */
(function(window, document, $, undefined) {
    'use strict';

    /*! Inspired by Modernizr 2.6.2| MIT & BSD
     * Build: http://modernizr.com/download/#-input-inputtypes
     */
    var Support = (function() {

            var Support = {},

                docElement = document.documentElement,

                inputElem = document.createElement('input'),

                selectElem = document.createElement('select'),

                textareaElem = document.createElement('textarea'),

                smile = ':)',

                tests = {},

                inputs = {},

                attrs = {},

                testElem;

            Support.attributes = (function(props) {
                for (var i = 0, len = props.length; i < len; i++) {
                    attrs[props[i]] = !!(props[i] in inputElem);
                }
                return attrs;
            })('max min multiple pattern required step'.split(' '));


            Support.inputtypes = (function(props) {

                for (var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++) {
                    inputElem.setAttribute('type', inputElemType = props[i]);
                    bool = inputElem.type !== 'text';

                    if (bool) {

                        inputElem.value = smile;
                        inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                        if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {

                            docElement.appendChild(inputElem);
                            defaultView = document.defaultView;

                            bool = defaultView.getComputedStyle &&
                                defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                                (inputElem.offsetHeight !== 0);

                            docElement.removeChild(inputElem);

                        } else if (/^(search|tel)$/.test(inputElemType)) {} else if (/^(url|email)$/.test(inputElemType)) {
                            bool = inputElem.checkValidity && inputElem.checkValidity() === false;
                        } else {
                            bool = inputElem.value !== smile;
                        }
                    }

                    inputs[props[i]] = !!bool;
                }

                return inputs;
            })('search tel url email datetime date month week time datetime-local number range color'.split(' '));

            (function(props) {
                for (var i = 0, len = props.length; i < len; i++) {
                    testElem = inputElem;

                    try {
                        testElem.setAttribute('type', props[i]);
                    } catch (e) {
                        testElem = document.createElement('<input type="' + props[i] + '">');
                    }

                    testElem.style.cssText = 'position:absolute;visibility:hidden;';
                    Support.inputtypes[props[i]] = !!testElem.checkValidity;
                }
            })('text password radio checkbox'.split(' '));

            Support.inputtypes.select = !!selectElem.checkValidity;
            Support.inputtypes.textarea = !!textareaElem.checkValidity;

            inputElem = null;
            testElem = null;
            selectElem = null;
            textareaElem = null;

            return Support;
        }()),

        Format = (function() {
            var rules = {
                    isoDate: /^(\d{4})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
                },

                utils = {
                    separators: /(\/|\-|\.)/g,
                    separatorsNoGroup: /\/|\-|\./g,
                    dateParts: {
                        dd: '(0[1-9]|[12][0-9]|3[01])',
                        mm: '(0[1-9]|1[012])',
                        yyyy: '(\\d{4})'
                    }
                };

            function indexOf(array, value) {
                var index = -1,
                    length = array ? array.length : 0;


                while (++index < length) {
                    if (array[index] === value) {
                        return index;
                    }
                }

                return -1;
            }


            function parseDate(element) {
                var format = element.getAttribute('data-format') || $.fn.validatr.options.dateFormat,
                    split = format.split(utils.separatorsNoGroup),
                    dateSplit = element.value.split(utils.separatorsNoGroup),
                    isoSplit = 'yyyy-mm-dd'.split('-'),
                    rule = format.replace(utils.separators, '\\$1')
                    .replace('yyyy', utils.dateParts.yyyy)
                    .replace('mm', utils.dateParts.mm)
                    .replace('dd', utils.dateParts.dd),
                    index = -1,
                    length = isoSplit.length,
                    iso = [];

                rule = new RegExp(rule);
                if (!rule.test(element.value)) {
                    return false;
                }

                while (++index < length) {
                    iso[index] = dateSplit[indexOf(split, isoSplit[index])];
                }

                return parseISODate(iso.join('-'));
            }

            function parseISODate(dateString) {
                if (!rules.isoDate.test(dateString)) {
                    return false;
                }

                var date = rules.isoDate.exec(dateString);
                return new Date(parseInt(date[1], 10), parseInt(date[2], 10) - 1, parseInt(date[3], 10));
            }

            function formatISODate(dateObj, element) {
                function pad(n) {
                    return n < 10 ? '0' + n : n;
                }

                var date = pad(dateObj.getDate()),
                    month = pad(dateObj.getMonth() + 1),
                    year = dateObj.getFullYear(),
                    dateString = (element.getAttribute('data-format') || $.fn.validatr.options.dateFormat).replace('mm', month).replace('yyyy', year).replace('dd', date);

                return dateString;
            }

            return {
                formatISODate: formatISODate,
                parseDate: parseDate,
                parseISODate: parseISODate
            };
        }()),

        Tests = (function() {
            var rules = {
                    color: /^#[0-9A-F]{6}$/i,
                    email: /^[a-zA-Z0-9.!#$%&’*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/,
                    isoDate: /^(\d{4})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
                    number: /^-?\d*\.?\d*$/,
                    time: /^([01][0-9]|2[0-3])(:([0-5][0-9])){2}$/,
                    url: /^\s*https?:\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?\s*$/
                },

                utils = {
                    boxes: /checkbox|radio/i,
                    spaces: /,\s*/
                },

                minMax = function(value, min, max, step, type) {
                    var result = true,
                        msg = $.validatr.messages.range.base,
                        minString = min,
                        maxString = max;

                    if (type === 'date') {
                        minString = min && Format.formatISODate(min, this);
                        maxString = max && Format.formatISODate(max, this);
                    }

                    if (value !== false) {
                        if (step !== false) {
                            result = step === 'any' ? true : (value - min) % step === 0;
                            msg = $.validatr.messages.range.invalid;
                        }

                        if (result) {
                            if (min !== false && max !== false) {
                                result = value >= min && value <= max;
                                msg = $.validatr.messages.range.overUnder;
                            } else if (min !== false) {
                                result = value >= min;
                                msg = $.validatr.messages.range.overflow;
                            } else if (max !== false) {
                                result = value <= max;
                                msg = $.validatr.messages.range.underflow;
                            }
                        }
                    }

                    return {
                        valid: value !== false && result,
                        message: msg.replace('{{type}}', type).replace('{{min}}', minString).replace('{{max}}', maxString)
                    };
                };

            return {
                checkbox: function(element) {
                    return {
                        valid: element.checked,
                        message: $.validatr.messages.checkbox
                    };
                },

                color: function(element) {
                    return {
                        valid: rules.color.test(element.value),
                        message: $.validatr.messages.color
                    };
                },

                date: function(element) {
                    var $element = $(element),
                        value = Support.inputtypes.date ? Format.parseISODate(element.value) : Format.parseDate(element),
                        min = $element.attr('min') ? Format.parseISODate($element.attr('min')) : false,
                        max = $element.attr('max') ? Format.parseISODate($element.attr('max')) : false,
                        step = false;

                    return minMax.call(element, value, min, max, step, 'date');
                },

                email: function(element) {
                    var valid = true,
                        msg = $.validatr.messages.email.single,
                        multiple = Support.attributes.multiple ? element.multiple : $(element).is('[multiple]');

                    if (multiple) {
                        var values = element.value.split(utils.spaces);

                        $.each(values, function(i, value) {
                            if (!rules.email.test(value)) {
                                valid = false;
                                msg = $.validatr.messages.email.multiple;
                                return;
                            }
                        });
                    } else {
                        valid = rules.email.test(element.value);
                    }

                    return {
                        valid: valid,
                        message: msg
                    };
                },

                number: function(element) {
                    var value = element.value.replace(',', ''),
                        num = rules.number.test(value) ? parseFloat(value) : false,
                        min = rules.number.test(element.getAttribute('min')) ? parseFloat(element.getAttribute('min')) : false,
                        max = rules.number.test(element.getAttribute('max')) ? parseFloat(element.getAttribute('max')) : false,
                        step = rules.number.test(element.getAttribute('step')) ? parseFloat(element.getAttribute('step')) : element.getAttribute('step') === 'any' ? 'any' : false;

                    if (step === false || step <= 0) {
                        step = 1;
                    }

                    return minMax.call(element, value, min, max, step, 'number');
                },

                pattern: function(element) {
                    return {
                        valid: new RegExp(element.getAttribute('pattern')).test(element.value),
                        message: $.validatr.messages.pattern
                    };
                },

                radio: function(element) {
                    return {
                        valid: $(document.getElementsByName(element.name)).is(':checked'),
                        message: $.validatr.messages.radio
                    };
                },

                range: function(element) {
                    return this.number(element);
                },

                required: function(element) {
                    if (utils.boxes.test(element.type)) {
                        return this[element.type](element);
                    }

                    return {
                        valid: !!element.value.length,
                        message: element.nodeName.toLowerCase() === 'select' ? $.validatr.messages.select : $.validatr.messages.required
                    };
                },

                time: function(element) {
                    return {
                        valid: rules.time.test(element.value),
                        message: $.validatr.messages.time
                    };
                },

                url: function(element) {
                    return {
                        valid: rules.url.test(element.value),
                        message: $.validatr.messages.url
                    };
                }
            };
        }()),

        CustomTests = (function() {
            function as(element) {
                if (element.type !== 'text') {
                    throw new Error('element must have a type of text');
                }

                var type = element.getAttribute('data-as');

                if (Tests[type]) {
                    return Tests[type](element);
                }
            }

            function match(element) {
                var value = element.getAttribute('data-match'),
                    source = document.getElementById(value) || document.getElementsByName(value)[0];

                if (!source) {
                    return {
                        valid: false,
                        message: '\'' + value + '\' can not be found'
                    };
                }

                $(source)
                    .off('valid.validatrinput')
                    .on('valid.validatrinput', function() {
                        if (element.value === source.value) {
                            validateElement(element);
                        }
                    });

                return {
                    valid: element.value === source.value,
                    message: '\'' + element.name + '\' does not equal \'' + source.name + '\''
                };
            }

            return {
                as: as,
                match: match
            };
        }()),

        filters = {
            boxes: /checkbox|radio/i,
            leftright: /left|right/i,
            notInput: /select|textarea/i,
            topbottom: /top|bottom/i
        },

        keyCodes = [
            16, // shift
            17, // control
            18, // alt
            19, // pause/break
            20, // caps lock
            33, // page up
            34, // page down
            35, // end
            36, // home
            37, // left arrow
            39 //right arrow
        ],

        // Validatr
        Validatr = function() {
            return {
                addTest: function(name) {
                    var isObject = typeof name !== 'string',
                        args = Array.prototype.slice.call(arguments, 1)[0];

                    if (isObject) {
                        $.extend(CustomTests, name);
                    } else {
                        if (!args) {
                            throw new Error('You must include a callback function');
                        }
                        CustomTests[name] = args;
                    }
                },

                getElements: function(form) {
                    if (this.formElements) {
                        return this.formElements;
                    }

                    var elements = $(form).map(function() {
                            return $.makeArray(this.elements);
                        })
                        .not('fieldset, button, input[type=submit], input[type=button], input[type=reset]');

                    if (form.id) {
                        elements = elements.add($('[form="' + form.id + '"]'));
                    }

                    return elements;
                },

                validateElement: function(element) {
                    if (!element) {
                        throw new Error('method requires an element');
                    }

                    var valid = validateElement(element[0] || element);

                    return valid;
                },

                validateForm: function(form) {
                    var element = this.el || (form instanceof jQuery ? form[0] : form),
                        valid;

                    if (element.nodeName.toLowerCase() !== 'form') {
                        throw new Error('you must pass a form to this method');
                    }

                    valid = validateForm(this.formElements || this.getElements(element));

                    return valid;
                }
            };
        };

    function validateElement(element) {
        if (element.type === 'radio') {
            var radio = $(document.getElementsByName(element.name)).filter('[required]');
            if (radio.length) {
                element = radio[0];
            }
        }

        var $element = $(element),
            type = filters.notInput.test(element.nodeName) ? element.nodeName.toLowerCase() : element.getAttribute('type'),
            required = Support.attributes.required ? element.required : $(element).is('[required]'),
            check = {
                valid: true,
                message: ''
            };

        if (Support.inputtypes[type]) {
            check.valid = element.validity.valid;
            check.message = element.validationMessage;
            check.message = ($(element).data('msg')) ? $(element).data('msg') : check.message;
        } else {
            if (required) {
                check = Tests.required(element);
            }

            if (check.valid && element.value.length && !filters.boxes.test(type)) {
                if (element.pattern) {
                    type = 'pattern';
                }

                if (Tests[type]) {
                    check = Tests[type](element);
                }
            }
        }

        if (check.valid) {
            for (var test in CustomTests) {
                if (CustomTests.hasOwnProperty(test) && $element.is('[data-' + test + ']')) {
                    check = CustomTests[test](element);
                    if (!check.valid) {
                        break;
                    }
                }
            }
        }

        if (check.valid) {
            $element.trigger('valid');
            return true;
        }

        $.data(element, 'validationMessage', check.message);
        $element.trigger('invalid');

        position($element, check.message);

        return false;
    }

    function validateForm(elements) {
        var valid = true;

        gee.clog('validatr start');

        elements.each(function(i, element) {
            $(element).next('.validatr-err').remove()
                .end().closest('.form-group').removeClass('has-error');
            if (valid || $.fn.validatr.options.showall) {
                if (!validateElement(element)) {
                    gee.clog('validatr false');
                    valid = false;
                }
            }
        });

        gee.clog('validatr end');

        return valid;
    }

    function position($target, msg) {
        /*jshint validthis:true */
        var error = $($.fn.validatr.options.template.replace('{{message}}', msg));

        $target.closest('.form-group').addClass('has-error').end().after(error);

        error.css('position', 'absolute');

        var offset = $target.offset(),
            location = $target[0].getAttribute('data-location') || $.fn.validatr.options.location;

        if (filters.topbottom.test(location)) {
            error.offset({ left: offset.left });

            if (location === 'top') {
                error.offset({ top: offset.top + 8 - error.outerHeight() - 2 });
            }

            if (location === 'bottom') {
                error.offset({ top: offset.top + 8 + $target.outerHeight() / 2 + error.outerHeight() });
            }
        } else if (filters.leftright.test(location)) {
            error.offset({ top: (offset.top + $target.outerHeight() / 2) - (error.outerHeight() / 2) });

            if (location === 'left') {
                error.offset({ left: offset.left - error.outerWidth() - 2 });
            }

            if (location === 'right') {
                error.offset({ left: offset.left + $target.outerWidth() + 2 });
            }
        }
    }

    $.fn.validatr = function() {
        return this;
    };

    $.fn.validatr.options = {
        dateFormat: 'yyyy-mm-dd',
        location: 'bottom',
        position: position,
        showall: true,
        template: '<div class="validatr-err text-danger">{{message}}</div>',
        valid: $.noop
    };

    $.validatr = new Validatr();

    $.validatr.messages = {
        checkbox: 'Please check this box if you want to proceed.',
        color: 'Please enter a color in the format #xxxxxx',
        email: {
            single: 'Please enter an email address.',
            multiple: 'Please enter a comma separated list of email addresses.'
        },
        pattern: 'Please match the requested format.',
        radio: 'Please select one of these options.',
        range: {
            base: 'Please enter a {{type}}',
            overflow: 'Please enter a {{type}} greater than or equal to {{min}}.',
            overUnder: 'Please enter a {{type}} greater than or equal to {{min}}<br> and less than or equal to {{max}}.',
            invalid: 'Invalid {{type}}',
            underflow: 'Please enter a {{type}} less than or equal to {{max}}.'
        },
        required: 'Please fill out this field.',
        select: 'Please select an item in the list.',
        time: 'Please enter a time in the format hh:mm:ss',
        url: 'Please enter a url.'
    };

    // Custom selector.
    $.expr[':'].validatr = function(elem) {
        return !!$.data(elem, 'validatr');
    };

    $.validatr.addTest('chinese', function (elem) {
        var re1 = new RegExp('^[\u4E00-\uFA29]*$'); //Chinese character range
        var re2 = new RegExp('^[\uE7C7-\uE7F3]*$'); //non Chinese character range
        var str = elem.value.replace(/\s/g, '');
        var chk = true;

        if (!re1.test(str)) { // || re2.test(str)
            chk = false;
        }

        return {
            valid: chk,
            message: 'Please enter some chinese.'
        };
    })

}(window, document, jQuery));


