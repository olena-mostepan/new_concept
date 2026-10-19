"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import type { Supplier, TenderConfig } from "@/types/tender"
import { SupplierCard } from "@/components/supplier-card"
import { ComparisonTable } from "@/components/comparison-table"
import { BidDetailsModal } from "@/components/bid-details-modal"
import { KeyFieldsModal } from "@/components/key-fields-modal"
import Link from "next/link"

type TenderComparisonPageProps = {
  config: TenderConfig
}

export function TenderComparisonPage({ config }: TenderComparisonPageProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showKeyFields, setShowKeyFields] = useState(false)
  const [showOverviewDetails, setShowOverviewDetails] = useState(false)
  const [showCompareButton, setShowCompareButton] = useState(false)
  const [sortBy, setSortBy] = useState<"price" | "name">("price")

  useEffect(() => {
    const handleScroll = () => {
      setShowCompareButton(window.scrollY > 800)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTable = () => {
    document.getElementById("comparison-table")?.scrollIntoView({
      behavior: "smooth",
    })
  }

  const sortedSuppliers = [...config.suppliers].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price
    return a.name.localeCompare(b.name)
  })

  const exportToCsv = () => {
    const header = ["Category/Field", ...sortedSuppliers.map((s) => s.name)]
    const rows: string[][] = []

    for (const category of config.categories) {
      rows.push([category.name, ...sortedSuppliers.map(() => "")])
      for (const field of category.fields) {
        const row: string[] = [field.label]
        for (const supplier of sortedSuppliers) {
          const value = supplier.fields?.[field.key] ?? "—"
          row.push(String(value))
        }
        rows.push(row)
      }
    }

    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${config.slug}-tender-comparison.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const responseRate = `${config.overview.responseRate}% response rate`

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-t border-b border-[#F3F4F6]">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center py-3">
            <Link href="/" className="btn-link gap-2 no-underline hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <button className="flex items-center gap-2 hover:opacity-80">
              <Image
                src="/site elements/profile.svg"
                alt="Profile"
                width={32}
                height={32}
              />
              <ChevronDown className="h-4 w-4 text-[#1E2832]" />
            </button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 pt-6 pb-3">
        <div className="flex items-start gap-6 mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0">
              <Image
                src={config.avatar}
                alt="Project icon"
                width={48}
                height={48}
                className="rounded object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-extrabold text-[#1E2832] leading-tight">
                {config.title}
              </h1>
            </div>
            <div className="text-sm text-[#4D5761] mb-3">{config.location}</div>
            <div className="flex items-center gap-2 flex-wrap">
              {config.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-xs font-medium rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Project Details Section */}
            {config.projectDetails && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {config.projectDetails.type && (
                    <div>
                      <div className="text-xs text-[#4D5761] mb-1">Type</div>
                      <div className="text-sm font-medium text-[#1E2832]">{config.projectDetails.type}</div>
                    </div>
                  )}
                  {config.projectDetails.expectedStartDate && (
                    <div>
                      <div className="text-xs text-[#4D5761] mb-1">Expected start date</div>
                      <div className="text-sm font-medium text-[#1E2832]">{config.projectDetails.expectedStartDate}</div>
                    </div>
                  )}
                  {config.projectDetails.sizeOfInstallation && (
                    <div>
                      <div className="text-xs text-[#4D5761] mb-1">Size of installation</div>
                      <div className="text-sm font-medium text-[#1E2832]">{config.projectDetails.sizeOfInstallation}</div>
                    </div>
                  )}
                  {config.projectDetails.usableRoofArea && (
                    <div>
                      <div className="text-xs text-[#4D5761] mb-1">Usable roof area</div>
                      <div className="text-sm font-medium text-[#1E2832]">{config.projectDetails.usableRoofArea}</div>
                    </div>
                  )}
                  {config.projectDetails.totalEnergyDemand && (
                    <div>
                      <div className="text-xs text-[#4D5761] mb-1">Total energy demand</div>
                      <div className="text-sm font-medium text-[#1E2832]">{config.projectDetails.totalEnergyDemand}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project photos — right of header */}
        {config.projectPhotos && config.projectPhotos.length > 0 && (
          <div className="flex gap-2 shrink-0">
            {config.projectPhotos.slice(0, 4).map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`Project photo ${i + 1}`}
                width={160}
                height={120}
                className="rounded-lg border border-[#F3F4F6] object-cover"
              />
            ))}
          </div>
        )}
        </div>

        <div className="mb-4 flex flex-col items-start gap-4 p-4 rounded-lg border border-[#F3F4F6] bg-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="font-bold text-[#1E2832]">Tender Overview:</div>
                <button
                  onClick={() => setShowOverviewDetails((v) => !v)}
                  className="text-sm text-[#1C75BC] hover:underline font-bold flex items-center gap-1"
                  style={{ fontSize: "14px", lineHeight: "normal" }}
                >
                  {showOverviewDetails ? (
                    <>
                      Hide details
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show details
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              <div className="text-sm text-[#4D5761]">
                <span className="font-semibold">{config.overview.submitted}</span> of{" "}
                <span className="font-semibold">{config.overview.invited}</span> suppliers submitted (
                <span className="font-semibold">{responseRate}</span>)
              </div>
              {showOverviewDetails && (
                <div className="mt-3 flex flex-col items-start gap-4 p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] self-stretch w-full">
                  <ul className="list-disc pl-6 space-y-1 text-sm text-[#4D5761]">
                    {config.overview.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <div className="text-sm text-[#4D5761]">
                    <span>Tender closed: {config.overview.closedDate}</span>
                    <span className="mx-2">|</span>
                    <span>Duration: {config.overview.duration}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="md:ml-6">
              <div
                className="flex h-6 px-3 items-center gap-1 rounded-[20px] border border-[#1C75BC] bg-[#1C75BC] text-white font-bold"
                style={{ fontSize: "14px", lineHeight: "normal" }}
              >
                Closed: {config.overview.closedDate}
              </div>
            </div>
          </div>
        </div>
      </div>

  <main className="w-full max-w-screen-2xl mx-auto pt-0 px-6 sm:px-8 lg:px-10 pb-6">
        <div
          className="flex flex-col items-start gap-4 self-stretch rounded-lg border border-[#F3F4F6] bg-white mb-8"
          style={{ padding: "32px 24px 16px 24px" }}
        >
          <div className="w-full flex items-center justify-between">
            <h2 className="text-[#1E2832] font-extrabold" style={{ fontSize: "20px", lineHeight: "normal" }}>
              Comparison overview
            </h2>
            <div className="flex items-center gap-3">
              <label className="text-sm text-[#4D5761]">
                Sort by:
                <select
                  className="ml-2 border border-[#D3D7DC] rounded px-2 py-1 text-sm"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as "price" | "name")}
                >
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
              </label>
              <button
                onClick={scrollToTable}
                className="flex h-10 px-3 justify-center items-center gap-4 rounded-lg border border-[#D3D7DC] bg-[#F9FAFB] text-[#1E2832] hover:bg-gray-100"
                style={{ fontSize: "14px", fontWeight: 700, lineHeight: "normal" }}
              >
                Compare Bids
              </button>
            </div>
          </div>
          <div className="space-y-3 w-full">
            {sortedSuppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} onViewDetails={setSelectedSupplier} />
            ))}
          </div>
        </div>

        <div id="comparison-table" className="mt-8">
          <ComparisonTable
            suppliers={sortedSuppliers}
            categories={config.categories}
            onSupplierClick={setSelectedSupplier}
            onShowKeyFields={() => setShowKeyFields(true)}
            onExportCsv={exportToCsv}
          />
        </div>
      </main>

      {showCompareButton && (
        <button
          onClick={scrollToTable}
          className="fixed bottom-8 right-8 flex h-12 px-5 items-center gap-2 rounded-full bg-[#1C75BC] text-white shadow-xl"
        >
          Compare bids
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      <BidDetailsModal
        supplier={selectedSupplier}
        open={!!selectedSupplier}
        onOpenChange={(open) => !open && setSelectedSupplier(null)}
      />

      {selectedSupplier && (
        <a
          href={`/supplier-comparison/${selectedSupplier.id}`}
          className="fixed bottom-24 right-8 z-50 flex h-12 px-5 items-center gap-2 rounded-full bg-[var(--cq-green)] text-white font-bold shadow-xl hover:bg-[var(--cq-green-hover)] no-underline"
        >
          Supplier profile
        </a>
      )}

      <KeyFieldsModal
        open={showKeyFields}
        fieldExplanations={config.fieldExplanations}
        onOpenChange={setShowKeyFields}
      />
    </div>
  )
}

