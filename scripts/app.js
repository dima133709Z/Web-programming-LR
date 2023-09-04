/**
 * Main validation form
 * @param {form} jquery obj - Form
 * @param {options} obj - object width params
 */

$.validator.setDefaults({
    ignore: []
});
const only_num = /^[0-9.]+$/;
const only_num_replace = /[^0-9.]/g;
const email_reg = /^(([^<>()\[\]\\.,;:\s@"]{2,62}(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z-аА-яЯ\-0-9]+\.)+[a-zA-Z-аА-яЯ]{2,62}))$/;

const mobile_regex = /^[+]*[0-9]{1,3}[\s][(]{0,1}[0-9]{1,2}[)]{0,1}[-\s\.\/0-9]*$/g;
const mobile_mask = '+1 999 999 99 99';
const mobile_mask_option = {placeholder: "_", showMaskOnHover: false};

const password_reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/s

const inputs = {
    'email': {
        'rules': {
            regex: email_reg,
            maxlength: 320,
            messages: {
                regex: message[locale].email,
                maxlength: message[locale].max_length + 320
            }
        }
    },
    'numeric': {
        'rules': {
            regex: only_num,
            messages: {
                regex: message[locale].only_num
            }
        }
    }
}


function validatorMethods() {

    $.validator.addMethod("regex", function (value, element, regexp) {
        var re = new RegExp(regexp);

        return value == '' || re.test(value);
    });

    $.validator.addMethod("regexReplace", function (value, element, regexp) {
        var re = new RegExp(regexp);
        element.value = element.value.replace(re, "");

        return true;
    });

}

function inputsRules($form) {
    $('[required]', $form).each(function () {
        $(this).rules("add", {
            required: true,
            messages: {
                required: message[locale].empty
            }
        });
    });

    $('[maxlength]', $form).each(function () {
        let max = $(this).attr('maxlength');
        $(this).rules("add", {
            maxlength: max,
            messages: {
                maxlength: message[locale].max_length + max
            }
        });
        $(this).on('input', function () {
            let maxLengthElement = $(this);
            let maxLength = parseInt(maxLengthElement.attr('maxlength'));
            if (maxLengthElement[0].value.length > maxLength)
                maxLengthElement[0].value = maxLengthElement[0].value.substr(0, maxLength);
        })
    });

    $('[minlength]', $form).each(function () {
        let min = $(this).attr('minlength');
        $(this).rules("add", {
            minlength: min,
            messages: {
                minlength: message[locale].min_length + min
            }
        });
    });

    if ($('[data-validation="tel"]', $form).length) {
        $('[data-validation="tel"]', $form).inputmask(mobile_mask, mobile_mask_option);

        $('[data-validation="tel"]', $form).rules("add", {
            regex: mobile_regex,
            messages: {
                regex: message[locale].not_enough,
                required: message[locale].empty
            }
        });
    }

    $('[data-validation="numeric"]', $form).each(function () {
        this.addEventListener('input', function () {
            let re = new RegExp(only_num_replace);
            this.value = this.value.replaceAll(',', '.');
            if(this.value.indexOf('.')===0)
                this.value = '0'+this.value
            this.value = this.value.replace(/[^.\d]+/g,"").replace( /^([^\.]*\.)|\./g, '$1' );
            if(this.value.length>4){
                if(this.value.indexOf('.')!== -1 && this.value.indexOf('.') !== this.value.length-1){
                    this.value = this.value.slice(0,5)
                } else {
                    this.value = this.value.slice(0,4)
                }
            }

        })
        this.addEventListener('focusout', function () {
            if(this.value.indexOf('.')===this.value.length-1)
                this.value = this.value+'0'
        })
    })


    $.each(inputs, function (data_id, opts) {
        var $input = $('[data-validation='+data_id+']', $form);

        if($input.length) {
            if (typeof opts.rules !== 'undefined') {
                validationRule($input,'add', opts.rules)
                if(typeof opts.rules.regexReplace !== 'undefined')
                    $input.valid();
            }
            if (typeof opts.mask !== 'undefined' && typeof opts.mask_option !== 'undefined'){
                $input.inputmask(opts.mask, opts.mask_option)
            } else if(typeof opts.mask !== 'undefined'){
                $input.inputmask(opts.mask)
            }
        }
    });
}

function validate(form, options) {
    var setings = {
        errorFunction: null,
        submitFunction: null,
        highlightFunction: null,
        unhighlightFunction: null
    };

    validatorMethods();

    $.extend(setings, options);

    if(typeof form !== 'string'){
        var $form = form;
    } else {
        var $form = $(form);
    }

    if ($form.length && $form.attr('novalidate') === undefined) {
        $form.on('submit', function (e) {
            e.preventDefault();
        });

        $form.validate({
            errorClass: 'errorText',
            focusCleanup: false,
            onclick: false,
            onfocusout: false,
            // onkeyup: false,
            focusInvalid: true,
            invalidHandler: function (event, validator) {
                if (typeof setings.errorFunction === 'function') {
                    setings.errorFunction(form);
                }
            },
            errorPlacement: function (error, element) {
                let thisContainer = element.closest('.input').find('.input__error');

                thisContainer.append(error);
            },
            highlight: function (element, errorClass, validClass) {
                let thisContainer = $(element).closest('.input');
                if(!thisContainer.length)
                    thisContainer = $(element).parent();

                thisContainer.addClass('is-invalid').removeClass('is-valid');
                $(element).addClass('is-invalid');

                if (typeof setings.highlightFunction === 'function') {
                    setings.highlightFunction(form);
                }
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).removeClass('is-invalid');
                $(element).closest('.input').removeClass('is-invalid').addClass('is-valid');
                if (typeof setings.unhighlightFunction === 'function') {
                    setings.unhighlightFunction(form);
                }
            },
            submitHandler: function (form) {
                $('[type=submit]', $(form)).each(function (){
                    $(this).attr('disabled', 'disabled');
                });
                if (typeof setings.submitFunction === 'function') {
                    setings.submitFunction(form);
                } else {
                    $form[0].submit();
                }
            }
        });

        inputsRules($form);
    }
}

function validationRule(input, action, rule){
    input.each(function () {
        if(rule == 'required' && action == 'add') {
            $(this).rules('add', {
                required: true,
                messages: {
                    required: message[locale].empty
                }
            });
        } else if(rule == 'required') {
            $(this).removeAttr('required')
            $(this).rules(action, rule);
        } else {
            $(this).rules(action, rule);
        }
    })
}

function addError(element, text){
    let name = element.attr('name');
    let error = $('<label id="'+name+'-error" class="errorText" for="'+name+'">'+text+'</label>');
    let inputContainer = element.closest('.input');
    let errorContainer = inputContainer.find('.input__error');

    console.log(name, inputContainer, errorContainer)
    errorContainer.empty();
    error.appendTo(errorContainer);
    element.addClass('error');
    element.closest('.input').addClass('error');
}

function popupOpenClose(action, popup, closeAfter, opts){
    if(!action || !popup) return false;
    switch(action){
        case 'open':
            $.fancybox.open({
                src: popup,
                type: '',
                opts: opts || {},
            });
            if(closeAfter){
                setTimeout(function () {
                    $.fancybox.close({
                        src: popup,
                        type: '',
                        opts: opts || {},
                    });
                }, closeAfter)
            }
            break;
        case 'close':
            $.fancybox.close({
                src: popup,
                type: '',
            });
            break;
    }
}

function dropdown(options) {
    let opts = {
        closeOnClick: true,
        timing: false
    }
    let timing = 300;

    $.extend( opts, options );

    function open(e) {
        e.preventDefault()
        let container = $(this).closest('.'+opts.containerClass)
        let thisDropdown = container.find(opts.dropdownSelector)

        if(e.type === 'focusin')
            container.addClass('focusin')

        if(((container.hasClass('open') && container.hasClass('checkbox')) || container.hasClass('disabled')) && !container.hasClass('focusin')){
            close()
            return;
        }

        if(e.type !== 'focusin')
            container.removeClass('focusin')

        close(container)

        container.addClass('open').css('z-index', '4')
        thisDropdown.slideDown(timing)
    }
    function close(dontClose = false) {
        let dropdownsToClose = $('.'+opts.containerClass)

        if(dontClose)
            dropdownsToClose = dropdownsToClose.not(dontClose)

        dropdownsToClose.find('li').removeClass('hover')

        dropdownsToClose.removeClass('open')
        dropdownsToClose.find(opts.dropdownSelector).slideUp(timing)

        setTimeout(function () {
            dropdownsToClose.removeAttr('style')
        }, timing)
    }

    $(document).on('click', function (e) {
        let thisEl = $(e.target)

        if(!thisEl.hasClass(opts.containerClass) && !thisEl.closest('.'+opts.containerClass).length)
            close()
    })
    $(document).on('click', '.'+opts.containerClass +' '+ opts.btnSelector, open)
    $(document).on('focusin', '.'+opts.containerClass +' '+ opts.btnSelector, open)
    $(document).on('focusout', '.'+opts.containerClass +' '+ opts.btnSelector, function () {
        $(this).closest('.'+opts.containerClass).removeClass('focusin')
        close($(this).closest('.'+opts.containerClass))
    })
    $(document).on('close-dropdown', close)



    if(options.timing !== false)
        timing = options.timing;
    if(options.containerClass === 'select')
        timing = 0;

    if(opts.closeOnClick){
        $(document).on('click', opts.dropdownSelector, function () {
            if(!$(this).closest('.'+opts.containerClass).hasClass('checkbox'))
                close()
        })
    }
}


function submitForm(form) {

    onSuccess()


    function onSuccess() {
        $('form').each(function () {
            this.reset()
        })
        $('.input--select .is-selected').removeClass('is-selected')

        $.fancybox.close({
            src: '#form-popup',
            type: '',
        });

        $(document).on('onComplete.fb', function (e,r,t) {
            if(t['src'] !== '#success-popup') return;
            let lott = lottie.loadAnimation({
                container: $('#success-popup .popup__ico')[0], // the dom element that will contain the animation
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: '/static/app/img/ico-plane.json' // the path to the animation json
            });
        })
        $.fancybox.open({
            src: '#success-popup',
            type: '',
            opts: {},
        });

        setTimeout(function () {
            $.fancybox.close({
                src: '#success-popup',
                type: '',
            });
        }, 3000)
    }
}

function blocks() {
    let methods = {
        //main page
        '.promo': function (section) {
            let forms = section.find('form')
            forms.each(function () {
                if(!$(this).hasClass('popup_form')) {
                    validate($(this), {submitFunction: submitForm})
                }
            })
        },
        '.reviews': function (section) {
            section.find('.reviews__slider').each(function () {
                new Swiper(this, {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    navigation: {
                        prevEl: '.swiper-button-prev',
                        nextEl: '.swiper-button-next'
                    },
                    pagination: {
                        el: '.swiper-pagination',
                        type: 'bullets',
                    },
                    breakpoints: {
                        769: {
                            slidesPerView: 2,
                            spaceBetween: 30
                        },
                        992: {
                            slidesPerView: 3,
                        },
                    }
                })
            })
        },

        //common
        '.input': function (inputs) {
            function inputNumberInit() {
                let inpNumber = '.input--number'
                let inpNumberEl = '.input--number input'

                let minusBtn = '.input__number-minus'
                let plusBtn = '.input__number-plus'


                $(document).on('click', minusBtn, function () {
                    let inputEl = $(this).closest('.input').find('input')
                    let thisMin = (inputEl.attr('min') && parseInt(inputEl.attr('min')) >= 0) ? parseInt(inputEl.attr('min')) : 1
                    let thisMax = (inputEl.attr('max') && parseInt(inputEl.attr('max')) >= thisMin) ? parseInt(inputEl.attr('max')) : false
                    let thisVal = parseInt(inputEl.val())

                    if (!thisVal) {
                        inputEl.val(thisMin)
                        return;
                    }

                    if (thisVal - 1 >= thisMin)
                        inputEl.val(thisVal - 1)
                })
                $(document).on('click', plusBtn, function () {
                    let inputEl = $(this).closest('.input').find('input')
                    let thisMin = (inputEl.attr('min') && parseInt(inputEl.attr('min')) >= 0) ? parseInt(inputEl.attr('min')) : 1
                    let thisMax = (inputEl.attr('max') && parseInt(inputEl.attr('max')) >= thisMin) ? parseInt(inputEl.attr('max')) : false
                    let thisVal = parseInt(inputEl.val())

                    if (!thisVal && thisVal !== 0) {
                        inputEl.val(thisMin)
                        return;
                    }
                    if (!thisMax) {
                        inputEl.val(thisVal + 1)
                        return;
                    }
                    if (thisVal + 1 <= thisMax)
                        inputEl.val(thisVal + 1)
                })
                $(document).on('focusout', inpNumberEl, function () {
                    let inputEl = $(this)
                    let thisMin = (inputEl.attr('min') && parseInt(inputEl.attr('min')) >= 0) ? parseInt(inputEl.attr('min')) : 1
                    let thisMax = (inputEl.attr('max') && parseInt(inputEl.attr('max')) >= thisMin) ? parseInt(inputEl.attr('max')) : false
                    let thisVal = parseInt(inputEl.val())

                    if (!thisVal)
                        $(this).val(thisMin)
                    if (thisVal < thisMin)
                        $(this).val(thisMin)
                    if (thisMax && thisVal > thisMax)
                        $(this).val(thisMax)
                })
            }

            function inputSelectInit() {
                let thisInput = '.input--select'
                let selectItems = '.input--select li'

                function selectItem(item) {
                    let thisItem = $(this)

                    if (typeof item.originalEvent === 'undefined')
                        thisItem = item
                    let thisContainer = thisItem.closest('.input')
                    let elseItems = thisContainer.find('.input__select li').not(thisItem)
                    let thisText = thisItem.text()
                    let thisVal = thisItem.attr('data-value')

                    thisContainer.find('input[type="hidden"]').val(thisVal)
                    thisContainer.find('input:not([type="hidden"])').val(thisText)

                    thisContainer.removeClass('is-invalid').addClass('is-valid')

                    thisItem.addClass('is-selected')
                    elseItems.removeClass('is-selected')
                }

                $('.input--select').each(function () {
                    let defaultVal = $(this).find('input[type="hidden"]').val()
                    if(defaultVal)
                        selectItem($('[data-value="' + defaultVal + '"]'))
                })


                $(document).on('click', selectItems, selectItem)
                dropdown( {
                    containerClass: 'input',
                    btnSelector: 'input:not([type="hidden"])',
                    dropdownSelector: '.input__select',
                    timing: 0
                })
            }

            inputNumberInit()
            inputSelectInit()
        },
        '.accordion': function (accordions) {
            let accBtns = accordions.find('.accordion__head')

            function closeAccordions(accToClose) {
                let thisBody = accToClose.find('.accordion__body')
                thisBody.slideUp(300)
                accToClose.removeClass('is-open')
            }
            function toggleAccordion() {
                let thisHead = $(this)
                let accordion = thisHead.closest('.accordion')
                let thisBody = accordion.find('.accordion__body')

                thisBody.slideToggle(300)
                accordion.toggleClass('is-open')

                //to close else
                let elseAccordions = accordion.closest('.accordion-list').find('.accordion.is-open').not(accordion)
                closeAccordions(elseAccordions)
            }

            accBtns.on('click', toggleAccordion)
        },

        '.menu': function (menu) {
            let btnOpen = $('.header__menu')
            let btnClose = $('.menu__close')

            btnOpen.on('click', function () {
                menu.addClass('menu--open')
                menu.fadeIn(300)
                btnOpen.css('opacity', '0')
            })
            btnClose.on('click', function () {
                menu.removeClass('menu--open')
                menu.fadeOut(300)
                btnOpen.fadeIn(300)
                btnOpen.css('opacity', '1')
            })

        },
        '.header': function (header) {
            $(window).on('scroll', function () {
                if(this.scrollY > 50){
                    header.addClass('header--scroll')
                } else {
                    header.removeClass('header--scroll')
                }
            })
        },
    }

    $.each(methods, function (selector, callback) {
        if($(selector).length)
            callback($(selector))
    })
}

function anchors() {
    $('a[href*="#"]').on('click', function () {
        let href = $(this).attr('href');
        let block = $('#'+href.split('#').pop());

        if(block.length) {
            $('html,body').animate({
                scrollTop: block.offset().top - 90 + "px"
            }, {
                duration: 1E3
            });
        }
    });
}

$(document).ready(function () {
    blocks()
    anchors()

    $('a[href*="openPopup-"], [class*="openPopup"]').on('click', function (e) {

        e.preventDefault()
        let href = $(this).attr('href');
        let thisPopup;

        if(href) {
            let hrefArr = href.split('-')
            hrefArr.shift()
            hrefArr = hrefArr.join('-')
            thisPopup = hrefArr
        } else {
            thisPopup = Array.from(this.classList).find(className => className.indexOf('openPopup-') === 0).replace('openPopup-', '')
        }

        if(thisPopup){
            e.preventDefault()
        } else {
            return;
        }

        thisPopup = '#'+thisPopup

        if(thisPopup === '#form-popup') {
            $(document).on('onComplete.fb', function (e,r,t) {
                console.log(t['src'])
                if(t['src'] !== '#form-popup') return;
                let thisHtml = $(thisPopup)[0].innerHTML

                $(thisPopup).empty()
                $(thisPopup).append(thisHtml)


                setTimeout(function () {
                    let $form = $('#popup_form')

                    $form.on('submit', function (e) {
                        e.preventDefault();
                    });

                    $form.validate({
                        errorClass: 'errorText',
                        focusCleanup: false,
                        onclick: false,
                        onfocusout: false,
                        // onkeyup: false,
                        focusInvalid: true,
                        errorPlacement: function (error, element) {
                            let thisContainer = element.closest('.input').find('.input__error');

                            thisContainer.append(error);
                        },
                        highlight: function (element, errorClass, validClass) {
                            let thisContainer = $(element).closest('.input');
                            if (!thisContainer.length)
                                thisContainer = $(element).parent();

                            thisContainer.addClass('is-invalid').removeClass('is-valid');
                            $(element).addClass('is-invalid');

                        },
                        unhighlight: function (element, errorClass, validClass) {
                            $(element).removeClass('is-invalid');
                            $(element).closest('.input').removeClass('is-invalid').addClass('is-valid');
                        },
                        submitHandler: function (form) {
                            submitForm(form)
                        }
                    });

                    inputsRules($form);
                }, 100)
            })
        }

        $.fancybox.open({
            src: thisPopup,
            type: '',
            opts: {},
        });

    });
})