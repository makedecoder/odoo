/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, t, useProps } from "@odoo/owl";
import { defaultCommandItemProps } from "@web/core/commands/command_palette";

const RECORD_ICONS = {
    "sale.order": "fa-shopping-cart",
    "purchase.order": "fa-shopping-bag",
    "account.move": "fa-file-text-o",
    "stock.picking": "fa-truck",
    "crm.lead": "fa-star",
    "res.partner": "fa-address-book-o",
    "product.product": "fa-cube",
    "project.project": "fa-folder-open",
    "project.task": "fa-tasks",
    "helpdesk.ticket": "fa-life-ring",
    "mrp.production": "fa-cogs",
    "account.payment": "fa-credit-card",
    "hr.employee": "fa-user",
    "hr.expense": "fa-money",
    "maintenance.request": "fa-wrench",
};

class RecordSearchCommand extends Component {
    static template = "makedecoder_quick_record_finder.RecordSearchCommand";
    props = useProps({
        ...defaultCommandItemProps,
        icon: t.string(),
    });
}

// Loaded only when the user enters a valid record query. Services are passed
// from the provider because Owl hooks cannot run after an asynchronous load.
registry.category("makedecoder_quick_record_finder").add("search", async (orm, action, query) => {
    const records = await orm.call("global.record.search", "search_records", [query]);
    return records.map((record) => ({
        Component: RecordSearchCommand,
        props: { icon: RECORD_ICONS[record.model] || "fa-file-o" },
        category: "global_records",
        name: `${record.name} — ${record.model_label}`,
        action: () => action.doAction({
            type: "ir.actions.act_window",
            name: record.name,
            res_model: record.model,
            res_id: record.id,
            views: [[false, "form"]],
            target: "current",
        }),
    }));
});
