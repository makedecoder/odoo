Quick Record Finder — Odoo 20

Search and access business records instantly from one unified search interface.

Quick Record Finder enhances Odoo 20's native command palette with a powerful, centralized record search experience. Simply press Ctrl + K, enter a record reference or keyword, and quickly find and open relevant business records without navigating through multiple menus.

Key Features
Unified Search: Search sales orders, purchase orders, invoices, journal entries, contacts, products, CRM leads, projects, tasks, and more from one place.
Quick Access: Instantly open matching records directly from the search results.
Smart Reference Search: Find records using document references, contact names, email addresses, product codes, and supported business identifiers.
Native Odoo Integration: Extends the existing Odoo command palette while preserving standard menu navigation and search results.
Optimized Performance: On-demand asset loading, 250ms query debouncing, and efficient search handling for a smooth user experience.
Secure Record Access: Respects the current user's access rights, record rules, active companies, and field-level permissions.
Controlled Results: Displays up to five matching records per model and forty records overall to keep results relevant and manageable.
Extensible Architecture: Supports additional business models and searchable fields through a dedicated extension method.
Supported Applications

Sales, Purchase, Invoicing, Accounting, Inventory, CRM, Contacts, Products, Projects, Helpdesk, Manufacturing, Payments, Employees, Expenses, and Maintenance.

How to Use
Press Ctrl + K anywhere in the Odoo web client.
Enter / followed by a search term or record reference.
Browse matching records under the Records section.
Click a result or press Enter to open the corresponding record form.
Technical Highlights
Compatible with Odoo 20.
Depends only on the standard web module.
Dynamically loads search assets when required.
Implements secure server-side record searching.
Includes integration tests for search functionality, access restrictions, and public-user security.

Quick Record Finder makes navigating Odoo faster, simpler, and more productive by bringing essential business records together in one intelligent search experience.

Installation
Extract the release ZIP into your custom addons directory. Keep its top-level
folder named makedecoder_quick_record_finder. Restart Odoo, update the Apps
list and install Quick Record Finder. The technical module name has changed;
an existing global_record_search installation is not automatically migrated.
