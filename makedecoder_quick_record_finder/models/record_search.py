from odoo import api, models
from odoo.exceptions import AccessError
from odoo.fields import Domain


# Optional applications do not become installation dependencies. Only installed,
# readable models are searched. Additional modules can extend this tuple.
SEARCH_MODELS = (
    ('sale.order', 'Sales Orders', ('name', 'client_order_ref')),
    ('purchase.order', 'Purchase Orders', ('name', 'partner_ref')),
    ('account.move', 'Invoices / Journal Entries', ('name', 'ref', 'payment_reference')),
    ('stock.picking', 'Transfers', ('name', 'origin')),
    ('crm.lead', 'Leads / Opportunities', ('name', 'email_from', 'phone')),
    ('res.partner', 'Contacts', ('name', 'email', 'phone', 'ref')),
    ('product.product', 'Products', ('name', 'default_code', 'barcode')),
    ('project.project', 'Projects', ('name',)),
    ('project.task', 'Tasks', ('name',)),
    ('helpdesk.ticket', 'Helpdesk Tickets', ('name',)),
    ('mrp.production', 'Manufacturing Orders', ('name', 'origin')),
    ('account.payment', 'Payments', ('name', 'memo')),
    ('hr.employee', 'Employees', ('name', 'work_email')),
    ('hr.expense', 'Expenses', ('name',)),
    ('maintenance.request', 'Maintenance Requests', ('name',)),
)


class GlobalRecordSearch(models.AbstractModel):
    _name = 'global.record.search'
    _description = 'Quick Record Finder'

    def _search_models(self):
        return SEARCH_MODELS

    @api.model
    def search_records(self, query, limit=40):
        """Return small, permission-filtered suggestions for the menu palette."""
        if not self.env.user.has_group('base.group_user'):
            raise AccessError(self.env._('Record search is only available to internal users.'))
        if not isinstance(query, str):
            return []
        query = query.strip()
        if len(query) < 2 or len(query) > 100:
            return []
        limit = max(1, min(int(limit), 40))
        results = []
        for model_name, label, candidates in self._search_models():
            if model_name not in self.env:
                continue
            model = self.env[model_name]
            try:
                if not model.has_access('read'):
                    continue
                # fields_get omits fields protected by groups. Avoid searching
                # a protected reference even if the record itself is readable.
                available = model.fields_get(list(candidates), ['type', 'searchable'])
                fields = [name for name in candidates if name in available
                          and available[name].get('searchable', True)]
                if not fields:
                    continue
                domain = Domain.OR([Domain(name, 'ilike', query) for name in fields])
                records = model.search(domain, limit=min(5, limit - len(results)), order='id desc')
                # No sudo: record rules, field access and company restrictions
                # apply both when searching and when obtaining result names.
                values = records.read(['display_name'])
            except AccessError:
                continue
            for value in values:
                results.append({
                    'model': model_name,
                    'id': value['id'],
                    'name': value['display_name'],
                    'model_label': self.env._(label),
                })
            if len(results) >= limit:
                break
        return results
