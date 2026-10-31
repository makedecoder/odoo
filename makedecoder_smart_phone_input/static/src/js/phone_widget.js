/** @odoo-module **/

import { Component, onMounted, onPatched, onWillStart, onWillUnmount, signal, t, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useBus, useService } from "@web/core/utils/hooks";
import { useInputField } from "@web/views/fields/input_field_hook";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

const $ = window.intlTelWidgetJQuery;
const utils = window.intlTelInputUtils;
const defaults = {
    allow_dropdown: true,
    exclude_country_codes: [],
    only_country_codes: [],
    preferred_country_codes: [],
    phone_number_type: "MOBILE",
    phone_number_format_type: "E164",
    separate_dial_code: false,
    sync_country: true,
    country_field: "country_id",
};

export class FieldIntlPhone extends Component {
    static template = "makedecoder_smart_phone_input.PhoneField";
    props = useProps({
        ...standardFieldProps,
        options: t.object().optional(),
        autocomplete: t.string().optional(),
    });
    inputRef = signal.ref();

    setup() {
        this.options = { ...defaults, ...this.props.options };
        this.countries = {};
        this.codes = {};
        this.iti = null;
        this.syncing = false;
        const orm = useService("orm");
        onWillStart(async () => {
            if (this.options.sync_country) {
                const countries = await orm.searchRead("res.country", [], ["code", "display_name"]);
                for (const country of countries) {
                    if (country.code) {
                        this.countries[country.id] = country.code.toLowerCase();
                        this.codes[country.code.toLowerCase()] = country;
                    }
                }
            }
        });
        useInputField({
            ref: this.inputRef,
            getValue: () => this.editValue,
            parse: (value) => this.parseValue(value),
        });
        onMounted(() => this.syncInput());
        onPatched(() => this.syncInput());
        onWillUnmount(() => this.destroyInput());
        useBus(this.props.record.model.bus, "NEED_LOCAL_CHANGES", () => {
            if (this.iti && this.$input.val() && !this.iti.isValidNumber()) {
                this.props.record.setInvalidField(this.props.name);
            }
        });
    }

    get countryCode() {
        if (!this.options.sync_country) {
            return undefined;
        }
        const country = this.props.record.data[this.options.country_field];
        const code = this.countries[country?.id];
        if (this.options.only_country_codes.length && !this.options.only_country_codes.includes(code)) {
            return undefined;
        }
        return this.options.exclude_country_codes.includes(code) ? undefined : code;
    }

    get value() {
        return this.props.record.data[this.props.name] || "";
    }

    get displayValue() {
        return utils.formatNumber(this.value, this.countryCode, utils.numberFormat.E164);
    }

    get editValue() {
        const code = this.countryCode || this.iti?.getSelectedCountryData().iso2;
        return this.value ? utils.formatNumber(this.value, code, utils.numberFormat.NATIONAL) : "";
    }

    parseValue(value) {
        if (!value) {
            return false;
        }
        if (!this.iti) {
            return value;
        }
        if (!this.iti.isValidNumber()) {
            throw new Error("Invalid phone number");
        }
        return this.options.phone_number_format_type === "SAME"
            ? this.$input.cleanVal()
            : this.iti.getNumber(utils.numberFormat[this.options.phone_number_format_type]) || value;
    }

    syncInput() {
        const input = this.inputRef();
        if (!input || this.$input?.[0] !== input) {
            this.destroyInput();
        }
        if (!input) {
            return;
        }
        this.syncing = true;
        try {
            if (!this.iti) {
                this.$input = $(input);
                this.$input.intlTelInput({
                    allowDropdown: this.options.allow_dropdown,
                    excludeCountries: this.options.exclude_country_codes,
                    onlyCountries: this.options.only_country_codes,
                    preferredCountries: this.options.preferred_country_codes,
                    initialCountry: this.countryCode || this.options.initial_country_code,
                    placeholderNumberType: this.options.phone_number_type,
                    separateDialCode: this.options.separate_dial_code,
                    customPlaceholder: (placeholder, country) => this.exampleNumber(country.iso2),
                });
                this.iti = this.$input.data("plugin_intlTelInput");
                this.$input.on("countrychange.phoneIntl", () => this.onCountryChange());
                this.lastCountry = this.countryCode;
            } else if (this.countryCode && this.countryCode !== this.lastCountry) {
                this.iti.setCountry(this.countryCode);
            }
            this.lastCountry = this.countryCode;
            if (!this.props.record.isFieldInvalid(this.props.name)) {
                this.iti._updateValFromNumber(input.value);
            }
            this.setMask();
        } finally {
            this.syncing = false;
        }
    }

    exampleNumber(code = this.iti?.getSelectedCountryData().iso2 || this.countryCode) {
        return utils.getExampleNumber(code, true, utils.numberType[this.options.phone_number_type]) || "";
    }

    setMask() {
        const mask = this.exampleNumber().replace(/\d/g, "0");
        if (mask !== this.lastMask) {
            this.$input.unmask();
            if (mask) {
                this.$input.mask(mask);
            }
            this.lastMask = mask;
        }
    }

    onCountryChange() {
        if (this.syncing) {
            return;
        }
        this.setMask();
        // A country selection changes the parsed value even without typing.
        this.$input[0].dispatchEvent(new Event("input", { bubbles: true }));
        const field = this.options.country_field;
        const country = this.codes[this.iti.getSelectedCountryData().iso2];
        if (this.options.sync_country && country && this.props.record.fields[field]?.type === "many2one"
            && this.props.record.data[field]?.id !== country.id) {
            this.props.record.update({ [field]: { id: country.id, display_name: country.display_name } });
        }
    }

    destroyInput() {
        if (this.$input) {
            this.$input.off(".phoneIntl");
            this.$input.unmask();
            this.iti?.destroy();
        }
        this.iti = null;
        this.$input = null;
        this.lastMask = undefined;
    }
}

registry.category("fields").add("phone_intl", {
    component: FieldIntlPhone,
    displayName: _t("International Phone"),
    supportedTypes: ["char"],
    extractProps: ({ options, attrs }) => ({ options, autocomplete: attrs.autocomplete }),
});
