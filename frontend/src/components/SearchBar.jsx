import { Search, X } from 'lucide-react'

function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search logs..."
        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
