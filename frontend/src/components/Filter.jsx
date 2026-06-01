import { useId, useMemo, useRef, useState, useEffect } from "react"

export default function Filter({
  value,
  label = "",
  onChange,
  name = "",
  options = [],
  render = (content) => content,
  otherOptions = [],
  className = "",
}) {
  const selectId = useId()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const allOptions = useMemo(
    () => [
      ...otherOptions,
      ...options.map((op) => ({
        key: render(op),
        value: op.id,
      })),
    ],
    [options, otherOptions, render]
  )

  const selectedOption =
    allOptions.find((op) => op.value === value) || allOptions[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (selectedValue) => {
    onChange({
      target: {
        name,
        value: selectedValue,
      },
    })

    setOpen(false)
  }

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="font-bold block">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={selectId}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="
            w-full
            h-[35px]
            pl-2
            items-center
            text-xs
            text-left
            bg-white
            border border-slate-200
            rounded-lg
            focus:border-red-400
            focus:outline-none
          "
        >
          {selectedOption?.key ?? "Sélectionner"}
        </button>

        {open && (
          <div
            className="
              absolute
              z-50
              mt-1
              w-full
              bg-white
              border
              border-slate-200
              rounded-lg
              shadow-lg
              overflow-hidden
            "
          >
            {allOptions.map((op, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(op.value)}
                className={`
                  w-full
                  px-3 py-2
                  text-left
                  text-sm
                  transition-colors
                  hover:bg-red-100
                  hover:text-red-700
                  ${op.value === value
                    ? "bg-red-100 text-red-700 font-medium"
                    : ""
                  }
                `}
              >
                {op.key}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}