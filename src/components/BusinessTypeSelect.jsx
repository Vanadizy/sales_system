import { Select } from './UI'
import { BUSINESS_TYPE_GROUPS } from '../constants/businessTypes'

const knownTypes = BUSINESS_TYPE_GROUPS.flatMap((group) => group.options)

export default function BusinessTypeSelect({ value, onChange, className = '', showHint = false }) {
  return <div className={className}>
    <Select label="Business type" value={value} onChange={onChange} required>
      {value && !knownTypes.includes(value) && <option value={value}>{value}</option>}
      {BUSINESS_TYPE_GROUPS.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map((type) => <option key={type} value={type}>{type}</option>)}</optgroup>)}
    </Select>
    {showHint && <p className="mt-1.5 text-xs text-slate-500">Choose the closest group, including phones, phone covers and accessories, laptops and peripherals, or select all products for a mixed catalogue.</p>}
  </div>
}
