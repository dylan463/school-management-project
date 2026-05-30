import { useQueryState } from "nuqs"

const parsers = {
    string: {
        parse: (v) => (v === '' ? '' : v),
        serialize: (v) => (v === '' ? '' : v),
    },
    number: {
        parse: (v) => (v === '' ? null : parseInt(v, 10)),
        serialize: (v) => (v === null ? '' : v.toString()),
    },
    boolean: {
        parse: (v) => (v === '' ? null : v === "true"),
        serialize: (v) => (v === null ? '' : v.toString()),
    },
}

/**
 * Gère plusieurs paramètres URL de façon typée.
 *
 * @param {Record<string, { key: string, type?: "string"|"number"|"boolean", default?: any }>} schema
 *
 * @example
 * const { search, page, active, setSearch, setPage, setActive } = useQueryParams({
 *   search: { key: "mention_search", type: "string",  default: "" },
 *   page:   { key: "mention_page",   type: "number",  default: 1  },
 *   active: { key: "mention_active", type: "boolean", default: false },
 * })
 */
export function useQueryParams(schema) {
    const states = Object.fromEntries(
        Object.entries(schema).map(([name, { key }]) => [name, useQueryState(key)])
    )

    const result = {}

    for (const [name, { type = "string", default: def }] of Object.entries(schema)) {
        const { parse, serialize } = parsers[type]
        const [raw, setRaw] = states[name]

        const parsed = parse(raw)
        result[name] = parsed !== null && !Number.isNaN(parsed) ? parsed : def

        const setterName = "set" + name.charAt(0).toUpperCase() + name.slice(1)
        result[setterName] = (v) => setRaw(serialize(v))
    }

    return result
}