# -*- coding: utf-8 -*-
{
    'name': "SmartDial",
    'version': '20.0.1.0.0',
    'author': "Makedecoder",
    'category': 'Extra Tools',
    'summary': "International phone input with country flags, smart formatting, and validation",
    'depends': ['web'],
    'assets': {
        'web.assets_backend': [
            'makedecoder_smart_phone_input/static/lib/jquery/jquery.js',
            'makedecoder_smart_phone_input/static/lib/jquery/isolate.js',
            'makedecoder_smart_phone_input/static/lib/intl-tel-input/js/utils.js',
            'makedecoder_smart_phone_input/static/lib/intl-tel-input/js/intlTelInput-jquery.js',
            'makedecoder_smart_phone_input/static/lib/jQuery-Mask/jquery.mask.js',
            'makedecoder_smart_phone_input/static/lib/intl-tel-input/css/intlTelInput.css',
            'makedecoder_smart_phone_input/static/src/scss/phone_widget.scss',
            'makedecoder_smart_phone_input/static/src/js/phone_widget.js',
            'makedecoder_smart_phone_input/static/src/xml/phone_widget.xml',
        ],
    },
    'images': ['static/description/banner.png'],
    'license': 'LGPL-3',
    'price': 29.0,
    'currency': 'USD',
    'installable': True,
    'auto_install': False,
    'application': False,
}
