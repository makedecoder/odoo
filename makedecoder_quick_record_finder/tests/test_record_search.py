from odoo import Command
from odoo.exceptions import AccessError
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestRecordSearch(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = cls.env['res.users'].create({
            'name': 'Record Search User',
            'login': 'makedecoder_quick_record_finder_test',
            'group_ids': [Command.set([
                cls.env.ref('base.group_user').id,
                cls.env.ref('base.group_partner_manager').id,
            ])],
        })
        cls.partner = cls.env['res.partner'].create({
            'name': 'GLOBALSEARCH Unique Contact', 'ref': 'GLOBALREF-00917',
        })
        cls.service = cls.env['global.record.search'].with_user(cls.user)

    def test_name_reference_and_limit(self):
        for query in ('GLOBALSEARCH', 'GLOBALREF-00917'):
            results = self.service.search_records(query)
            self.assertTrue(any(row['model'] == 'res.partner'
                                and row['id'] == self.partner.id for row in results))
        self.assertLessEqual(len(self.service.search_records('GLOBALSEARCH', limit=1)), 1)
        self.assertEqual(self.service.search_records(''), [])
        self.assertEqual(self.service.search_records('S'), [])
        self.assertEqual(self.service.search_records('x' * 101), [])

    def test_record_rules_are_respected(self):
        self.env['ir.access'].create({
            'name': 'Hide search test partner',
            'model_id': self.env['ir.model']._get('res.partner').id,
            'operation': 'r',
            'domain': repr([('id', '!=', self.partner.id)]),
        })
        results = self.service.search_records('GLOBALSEARCH')
        self.assertFalse(any(row['model'] == 'res.partner'
                             and row['id'] == self.partner.id for row in results))

    def test_public_user_is_rejected(self):
        with self.assertRaises(AccessError):
            self.env['global.record.search'].with_user(
                self.env.ref('base.public_user')).search_records('GLOBALSEARCH')
