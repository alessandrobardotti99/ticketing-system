"use client"

import type React from "react"
import { useState } from "react"
import { useTicketStatuses } from "@/hooks/use-ticket-statuses"
import { X, Palette } from "lucide-react"
import type { TicketStatus } from "@/hooks/use-ticket-statuses"

interface EditStatusModalProps {
  status: TicketStatus
  onClose: () => void
}

const colorPresets = [
  { name: "Blue", value: "bg-blue-50 border-blue-200 text-blue-800" },
  { name: "Green", value: "bg-green-50 border-green-200 text-green-800" },
  { name: "Yellow", value: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { name: "Red", value: "bg-red-50 border-red-200 text-red-800" },
  { name: "Purple", value: "bg-purple-50 border-purple-200 text-purple-800" },
  { name: "Pink", value: "bg-pink-50 border-pink-200 text-pink-800" },
  { name: "Indigo", value: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  { name: "Orange", value: "bg-orange-50 border-orange-200 text-orange-800" },
  { name: "Teal", value: "bg-teal-50 border-teal-200 text-teal-800" },
  { name: "Cyan", value: "bg-cyan-50 border-cyan-200 text-cyan-800" },
  { name: "Neutral", value: "bg-neutral-50 border-neutral-200 text-neutral-800" },
  { name: "Slate", value: "bg-slate-50 border-slate-200 text-slate-800" },
]

export function EditStatusModal({ status, onClose }: EditStatusModalProps) {
  const { updateStatus } = useTicketStatuses()
  const [formData, setFormData] = useState({
    label: status.label,
    color: status.color,
    customColor: colorPresets.find((p) => p.value === status.color) ? "" : status.color,
    useCustomColor: !colorPresets.find((p) => p.value === status.color),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalColor = formData.useCustomColor ? formData.customColor : formData.color

    updateStatus(status.id, {
      label: formData.label,
      color: finalColor,
    })
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <h2 className="text-xl font-bold">Edit Status</h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Status Label <span className="text-red-500">*</span>
            </label>
            <input type="text" name="label" value={formData.label} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color Theme</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="preset-colors"
                  name="colorType"
                  checked={!formData.useCustomColor}
                  onChange={() => setFormData({ ...formData, useCustomColor: false })}
                />
                <label htmlFor="preset-colors" className="text-sm">
                  Use preset colors
                </label>
              </div>

              {!formData.useCustomColor && (
                <div className="grid grid-cols-3 gap-2 ml-6">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: preset.value })}
                      className={`p-2 text-xs border-2 transition-all ${
                        formData.color === preset.value ? "ring-2 ring-neutral-400" : ""
                      } ${preset.value}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="custom-color"
                  name="colorType"
                  checked={formData.useCustomColor}
                  onChange={() => setFormData({ ...formData, useCustomColor: true })}
                />
                <label htmlFor="custom-color" className="text-sm">
                  Use custom Tailwind classes
                </label>
              </div>

              {formData.useCustomColor && (
                <div className="ml-6">
                  <input
                    type="text"
                    name="customColor"
                    value={formData.customColor}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., bg-emerald-50 border-emerald-200 text-emerald-800"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter Tailwind CSS classes for background, border, and text
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border border-neutral-200 p-3">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div
              className={`inline-block px-3 py-1 text-sm font-medium border ${
                formData.useCustomColor ? formData.customColor : formData.color
              }`}
            >
              {formData.label}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Update Status
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
