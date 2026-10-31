{
    'name': 'Quick Record Finder',
    'version': '20.0.1.1.0',
    'summary': 'Quick Record Finder makes navigating Odoo faster, simpler, and more productive by bringing essential business records together in one intelligent search experience.',
    'description': """
Find business records across your installed Odoo apps without switching menus.
Press Ctrl+K and type / followed by a name, email, product code or document
reference to search supported records, including sales orders, purchase orders,
invoices, contacts, products, transfers, projects and tasks. Select a result to
open its form directly in your current window.

Search respects user permissions, record rules and active companies. Record
search assets load on demand, and native menu search remains available.
""",
    'category': 'Productivity',
    'author': 'Makedecoder',
    'support': 'maheshkumarmgimt@gmail.com',
    'price': 5.0,
    'currency': 'USD',
    'license': 'LGPL-3',
    'images': ['static/description/banner.png'],
    'depends': ['web'],
    'assets': {
        'web.assets_backend': [
            'makedecoder_quick_record_finder/static/src/record_search.js',
            'makedecoder_quick_record_finder/static/src/record_search.xml',
        ],
        'makedecoder_quick_record_finder.assets_search': [
            'makedecoder_quick_record_finder/static/src/record_search_lazy.js',
        ],
    },
    'installable': True,
    'application': False,
}
