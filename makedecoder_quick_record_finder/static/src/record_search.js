/** @odoo-module **/
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { loadBundle } from "@web/core/assets";
import "@web/webclient/menus/menu_providers";

const setups = registry.category("command_setup");
setups.add("/", {
    ...setups.get("/"),
    debounceDelay: 250,
    emptyMessage: _t("No matching menu or record found. Try a name, email, product code or document reference (at least 2 characters)."),
    placeholder: _t("Search menus or records: name, email, reference..."),
}, { force: true });

registry.category("command_categories").add("global_records", {
    namespace: "/",
    name: _t("Records"),
}, { sequence: 30 });

let searchBundle;
let searchVersion = 0;

async function getRecordSearch() {
    if (!searchBundle) {
        searchBundle = loadBundle("makedecoder_quick_record_finder.assets_search").catch((error) => {
            searchBundle = undefined;
            throw error;
        });
    }
    await searchBundle;
    return registry.category("makedecoder_quick_record_finder").get("search");
}

// Extend the existing menu palette instead of replacing its template/provider.
registry.category("command_provider").add("global_records", {
    namespace: "/",
    async provide(options) {
        // Odoo 20 invokes providers in the palette's hook scope. Obtain services
        // before awaiting the RPC so hooks retain their component context.
        const orm = useService("orm");
        const action = useService("action");
        const query = (options.searchValue || "").trim();
        const version = ++searchVersion;
        if (query.length < 2 || query.length > 100) {
            return [];
        }
        try {
            const search = await getRecordSearch();
            if (version !== searchVersion) {
                return [];
            }
            const commands = await search(orm, action, query);
            return version === searchVersion ? commands : [];
        } catch {
            // Keep native menu navigation usable if record search is unavailable.
            return [];
        }
    },
});
