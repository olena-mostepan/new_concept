"use client"

import type { Supplier } from "@/types/tender"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

interface SupplierCardProps {
  supplier: Supplier
  onViewDetails: (supplier: Supplier) => void
}

function isTBCOrNotRequired(value?: string): boolean {
  if (!value) return false
  const v = value.toLowerCase()
  return v.includes("tbc") || v.includes("not required")
}

// Format price in user-friendly abbreviated format (e.g., 1.16k, 1.5M)
function formatPrice(price: number, currency: string = "£"): string {
  if (price >= 1000000) {
    return `${currency}${(price / 1000000).toFixed(2).replace(/\.?0+$/, '')}M`
  } else if (price >= 1000) {
    return `${currency}${(price / 1000).toFixed(2).replace(/\.?0+$/, '')}k`
  }
  return `${currency}${price.toLocaleString()}`
}

export function SupplierCard({ supplier, onViewDetails }: SupplierCardProps) {
  return (
    <Card className="flex flex-col justify-center items-start gap-5 self-stretch border border-gray-200 w-full" style={{ padding: '20px' }}>
      {/* Header: name on left, logo and actions on right */}
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1 text-[#1E2832]">{supplier.name}</h3>
        </div>
        <div className="flex flex-col justify-center items-start gap-2.5 h-10">
          <Image
            src={supplier.logo || "/placeholder.svg"}
            alt={`${supplier.name} logo`}
            width={80}
            height={40}
            className="object-contain h-full w-auto"
          />
        </div>
      </div>

      {/* Field boxes with borders and proper styling */}
      <div className="flex gap-3 w-full">
        {/* Show Price, Delivery time, Maintenance term, PPA if they exist, otherwise show legacy fields */}
        {supplier.fields.deliveryTime !== undefined ? (
          <>
            <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
              <div className="text-xs text-[#4D5761] font-normal">Price</div>
              <div className="text-base font-bold text-[#1E2832]">
                {formatPrice(supplier.price, (supplier.fields.totalLamps !== undefined || supplier.fields.systemLifespanYears !== undefined) ? '€' : '£')}
              </div>
            </div>
            {/* Show LED-specific fields if they exist, otherwise show HVAC or Solar PV fields */}
            {supplier.fields.totalLamps !== undefined ? (
              <>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">Total Lamps</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.totalLamps ?? "—"}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">Delivery (days)</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.deliveryTime ?? "—"}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">Annual Energy (kWh)</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.annualEnergykWh ?? "—"}
                  </div>
                </div>
              </>
            ) : supplier.fields.systemLifespanYears !== undefined ? (
              <>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">Delivery time (days)</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.deliveryTime ?? "—"}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">System lifespan (years)</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.systemLifespanYears ?? "—"}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">Manufacturer</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.manufacturer ?? "—"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">Delivery time (days)</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.deliveryTime ?? "—"}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">Maintenance term (years)</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.maintenanceTerm ?? "—"}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="text-xs text-[#4D5761] font-normal">PPA</div>
                  <div className="text-sm font-semibold text-[#1E2832]">
                    {supplier.fields.ppa ?? "—"}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
              <div className="text-xs text-[#4D5761] font-normal">Price</div>
              <div className="text-base font-bold text-[#1E2832]">{formatPrice(supplier.price)}</div>
            </div>
            <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
              <div className="text-xs text-[#4D5761] font-normal">Equipment removal</div>
              <div className={`text-sm font-semibold text-[#1E2832] ${isTBCOrNotRequired(supplier.fields.equipmentRemoval ?? undefined) ? "bg-orange-100 text-orange-700 px-1.5 py-0.5 inline-block rounded" : ""}`}>
                {supplier.fields.equipmentRemoval ?? "—"}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
              <div className="text-xs text-[#4D5761] font-normal">Unit location</div>
              <div className={`text-sm font-semibold text-[#1E2832] ${isTBCOrNotRequired(supplier.fields.unitLocation ?? undefined) ? "bg-orange-100 text-orange-700 px-1.5 py-0.5 inline-block rounded" : ""}`}>
                {supplier.fields.unitLocation ?? "—"}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
              <div className="text-xs text-[#4D5761] font-normal">Electrical work</div>
              <div className={`text-sm font-semibold text-[#1E2832] ${isTBCOrNotRequired(supplier.fields.electricalWork ?? undefined) ? "bg-orange-100 text-orange-700 px-1.5 py-0.5 inline-block rounded" : ""}`}>
                {supplier.fields.electricalWork ?? "—"}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
              <div className="text-xs text-[#4D5761] font-normal">Noise</div>
              <div className={`text-sm font-semibold text-[#1E2832] ${isTBCOrNotRequired(supplier.fields.noiseControl ?? undefined) ? "bg-orange-100 text-orange-700 px-1.5 py-0.5 inline-block rounded" : ""}`}>
                {supplier.fields.noiseControl ?? "—"}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 flex-1 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
              <div className="text-xs text-[#4D5761] font-normal">Operating temps</div>
              <div className={`text-sm font-semibold text-[#1E2832] ${isTBCOrNotRequired(supplier.fields.operatingTemps ?? undefined) ? "bg-orange-100 text-orange-700 px-1.5 py-0.5 inline-block rounded" : ""}`}>
                {supplier.fields.operatingTemps ?? "—"}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Key Differentiator box and Action buttons in same row */}
      <div className="flex items-start gap-3 w-full">
        {/* Key Differentiator box */}
        <div className="flex items-start gap-2 flex-1 rounded-lg border border-[#D2E3F2] bg-[#E8F1F8]" style={{ padding: '12px 16px' }}>
          <span className="text-[#1E2832] whitespace-nowrap" style={{ fontSize: '14px', fontWeight: 700, lineHeight: 'normal' }}>💡 Key Differentiator: </span>
          <span className="text-sm text-[#4D5761]">{supplier.keyDifferentiator}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 px-4 flex-col justify-center items-center gap-2 rounded-lg bg-[var(--cq-green)] text-white hover:bg-[var(--cq-green-hover)] whitespace-nowrap"
            style={{ boxShadow: '0 2px 0 0 rgba(0, 0, 0, 0.02)', fontSize: '14px', fontWeight: 700, lineHeight: 'normal' }}
            onClick={() => {/* placeholder for contact action */}}
          >
            Contact Supplier
          </button>
          <button
            type="button"
            className="flex h-10 px-3 justify-center items-center gap-4 rounded-lg border border-[#D3D7DC] bg-[#F9FAFB] text-[#1E2832] hover:bg-gray-100 whitespace-nowrap"
            style={{ fontSize: '14px', fontWeight: 700, lineHeight: 'normal' }}
            onClick={() => onViewDetails(supplier)}
          >
            View full details
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}
