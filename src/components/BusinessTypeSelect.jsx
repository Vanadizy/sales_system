import { BUSINESS_TYPE_GROUPS } from '../constants/businessTypes'

const knownTypes = BUSINESS_TYPE_GROUPS.flatMap((group) => group.options)
const separator = ' | '
const selectedTypes = (value) => String(value || '').split(separator).filter(Boolean)

export default function BusinessTypeSelect({ value, onChange, className = '' }) {
  const selected = selectedTypes(value)
  const customTypes = selected.filter((type) => !knownTypes.includes(type))
  const toggle = (type, checked) => {
    const next = checked ? [...new Set([...selected, type])] : selected.filter((entry) => entry !== type)
    if (!next.length) return
    onChange({ target: { value: next.join(separator) } })
  }

  return <fieldset className={`block text-sm font-medium text-slate-700 dark:text-slate-200 ${className}`}>
    <legend className="mb-1.5 block">Business types</legend>
    <details className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <summary className="cursor-pointer px-3 py-2.5 font-normal text-slate-700 dark:text-slate-200">
        {selected.join(', ') || 'Select one or more business types'}
      </summary>
      <div className="max-h-72 space-y-4 overflow-y-auto border-t p-3">
        {customTypes.length > 0 && <BusinessTypeGroup label="Previously saved" options={customTypes} selected={selected} toggle={toggle} />}
        {BUSINESS_TYPE_GROUPS.map((group) => <BusinessTypeGroup key={group.label} label={group.label} options={group.options} selected={selected} toggle={toggle} />)}
      </div>
    </details>
  </fieldset>
}

function BusinessTypeGroup({ label, options, selected, toggle }) {
  return <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <div className="grid gap-2">
      {options.map((type) => <label className="flex items-start gap-2 font-normal" key={type}>
        <input
          className="mt-0.5 h-4 w-4 rounded accent-brand-600"
          type="checkbox"
          checked={selected.includes(type)}
          onChange={(event) => toggle(type, event.target.checked)}
        />
        <span>{type}</span>
      </label>)}
    </div>
  </div>
}
