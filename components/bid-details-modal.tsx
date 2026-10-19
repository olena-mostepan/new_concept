"use client"

import type { Supplier } from "@/types/tender"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Building2, ChevronDown, ChevronUp, Download, Info } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { SupplierCompanyProfileData } from "@/components/supplier-company-profile"

interface BidDetailsModalProps {
  supplier: Supplier | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional company profile data; falls back to Photon Energy default when absent */
  companyProfile?: SupplierCompanyProfileData | null
}

function isTBCOrNotRequired(value: string): boolean {
  return value.toLowerCase().includes("tbc") || value.toLowerCase().includes("not required")
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

export function BidDetailsModal({ supplier, open, onOpenChange, companyProfile }: BidDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"proposal" | "about">("proposal")
  const [expandedSections, setExpandedSections] = useState<string[]>(["Price"])
  const [showRelevanceTooltip, setShowRelevanceTooltip] = useState(false)
  if (!supplier) return null

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white p-0">
        <>
        {/* Header with Logo and Company Name - Green Gradient Background */}
        <SheetHeader 
          className="p-6 pb-4 pr-14"
          style={{ background: 'linear-gradient(136deg, rgba(201, 255, 230, 0.33) 26.24%, rgba(7, 163, 91, 0.27) 98.78%)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <SheetTitle 
                className="text-[#1E2832] font-extrabold block"
                style={{ fontSize: '24px', lineHeight: 'normal' }}
              >
                {supplier.name}
              </SheetTitle>
            </div>
            <Image
              src={supplier.logo || "/placeholder.svg"}
              alt={`${supplier.name} logo`}
              width={80}
              height={40}
              className="object-contain"
            />
          </div>

          {/* CTAs in header - in a row */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`/supplier-comparison/${supplier.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 flex-1 min-w-[120px] px-4 justify-center items-center gap-2 rounded-lg bg-[var(--cq-green)] text-white hover:bg-[var(--cq-green-hover)] font-bold no-underline"
              style={{ boxShadow: '0 2px 0 0 rgba(0, 0, 0, 0.02)', fontSize: '14px', lineHeight: 'normal' }}
            >
              <Building2 className="w-4 h-4" />
              Supplier profile
            </a>
            <button
              className="flex h-10 flex-1 min-w-[120px] px-4 justify-center items-center gap-2 rounded-lg bg-[var(--cq-green)] text-white hover:bg-[var(--cq-green-hover)]"
              style={{ boxShadow: '0 2px 0 0 rgba(0, 0, 0, 0.02)', fontSize: '14px', fontWeight: 700, lineHeight: 'normal' }}
            >
              Contact supplier
            </button>
            <button
              className="flex h-10 flex-1 min-w-[120px] px-3 justify-center items-center gap-2 rounded-lg border border-[#D3D7DC] bg-[#F9FAFB] text-[#1E2832] hover:bg-gray-100"
              style={{ fontSize: '14px', fontWeight: 700, lineHeight: 'normal' }}
            >
              <Download className="h-4 w-4" />
              Download proposal
            </button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex border-b border-[#F3F4F6] px-6 mt-0">
          <button
            onClick={() => setActiveTab("proposal")}
            className={`pb-3 px-1 font-semibold text-sm relative ${
              activeTab === "proposal" 
                ? "text-[#1E2832] border-b-2 border-[var(--cq-green)]" 
                : "text-[#4D5761]"
            }`}
          >
            Proposal
          </button>
          <button
            onClick={() => {
              setActiveTab("about")
              // Auto-expand Company Info when switching to About tab
              if (!expandedSections.includes("Company Info")) {
                setExpandedSections(prev => [...prev, "Company Info"])
              }
            }}
            className={`pb-3 px-1 ml-6 font-semibold text-sm relative ${
              activeTab === "about" 
                ? "text-[#1E2832] border-b-2 border-[var(--cq-green)]" 
                : "text-[#4D5761]"
            }`}
          >
            About Company
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* About Company Tab Content */}
          {activeTab === "about" && (
            <div className="space-y-6">
              {/* Company Info Section */}
              <div className="border-0">
                <button
                  onClick={() => toggleSection("Company Info")}
                  className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-extrabold hover:opacity-70 transition-opacity"
                  style={{ fontSize: '20px', lineHeight: 'normal' }}
                >
                  <span>Company Info</span>
                  {expandedSections.includes("Company Info") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedSections.includes("Company Info") && (
                  <div className="pt-3 pb-4 space-y-6">
                    {/* Relevance Score - Prominent Card */}
                    {supplier.supplierRelevance?.generalScore && (
                      <div className="rounded-lg border-2 border-[var(--cq-green)] bg-gradient-to-br from-[#FDF0EB] to-[#FAD9CC] p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wide">
                                Relevance Score
                              </div>
                              <div className="relative inline-block">
                                <button
                                  onMouseEnter={() => setShowRelevanceTooltip(true)}
                                  onMouseLeave={() => setShowRelevanceTooltip(false)}
                                  className="text-[var(--cq-green)] hover:text-[var(--cq-green-hover)] transition-colors"
                                >
                                  <Info size={14} />
                                </button>
                                {showRelevanceTooltip && (
                                  <div
                                    className="absolute z-50 w-64 p-3 text-xs bg-white border border-[#d3d7dc] rounded-lg shadow-lg"
                                    style={{
                                      bottom: "100%",
                                      left: "0",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    <div className="whitespace-pre-line text-[#4d5761]">
                                      The relevance score evaluates how well the supplier matches your project requirements based on:
                                      {"\n\n"}
                                      • Asset type experience
                                      {"\n"}
                                      • Stakeholder management capabilities
                                      {"\n"}
                                      • Experience with similar asset sizes
                                      {"\n"}
                                      • Location and market presence
                                      {"\n\n"}
                                      Higher scores indicate better alignment with your specific project needs.
                                    </div>
                                    <div
                                      className="absolute w-2 h-2 bg-white border-r border-b border-[#d3d7dc]"
                                      style={{
                                        bottom: "-6px",
                                        left: "20px",
                                        transform: "rotate(45deg)",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-2xl font-extrabold text-[#1E2832]">
                              {supplier.supplierRelevance.generalScore}<span className="text-lg text-[#4D5761]">/5</span>
                            </div>
                            <div className="text-xs text-[#4D5761] mt-1">
                              Overall relevance to this project
                            </div>
                          </div>
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cq-green)] text-white ml-4">
                            <span className="text-2xl font-extrabold">{supplier.supplierRelevance.generalScore}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    <div>
                      <div className="font-bold text-base text-[#1E2832] mb-2">Experience</div>
                      <p className="text-sm text-[#4D5761]">
                        <span className="font-bold">18+ years</span> in the solar industry.
                      </p>
                    </div>

                    {/* Projects Delivered */}
                    <div>
                      <div className="font-bold text-base text-[#1E2832] mb-2">Projects Delivered</div>
                      <p className="text-sm text-[#4D5761] mb-2">
                        <span className="font-bold">80+ commercial projects</span>, including:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                        <li>Inverter servicing.</li>
                        <li>1 MW system for GreenSpace Logistics</li>
                        <li>750 kW system for Westbay Industrial Park</li>
                      </ul>
                    </div>

                    {/* Client Focus */}
                    <div>
                      <div className="font-bold text-base text-[#1E2832] mb-2">Client Focus</div>
                      <p className="text-sm text-[#4D5761]">
                        <span className="font-bold">90%</span> of projects are large-scale commercial installations
                      </p>
                    </div>

                    {/* Team */}
                    <div>
                      <div className="font-bold text-base text-[#1E2832] mb-2">Team</div>
                      <p className="text-sm text-[#4D5761] mb-2">
                        <span className="font-bold">120 staff members</span>, including:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                        <li>40 certified engineers</li>
                        <li>30 solar energy technicians</li>
                      </ul>
                    </div>

                    {/* Credentials */}
                    <div>
                      <div className="font-bold text-base text-[#1E2832] mb-2">Credentials</div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                        <li>NABCEP-certified installers</li>
                        <li>ISO 9001-certified for quality management</li>
                      </ul>
                    </div>

                    {/* Financial Stability */}
                    <div>
                      <div className="font-bold text-base text-[#1E2832] mb-2">Financial Stability</div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                        <li>Annual turnover: <span className="font-bold">£15 million</span></li>
                        <li><span className="font-bold">5% growth</span> over the last three years</li>
                        <li>Net assets: <span className="font-bold">£2 million</span></li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Case Studies Section */}
              <div className="border-0 border-t border-[#F3F4F6] pt-4">
                <button
                  onClick={() => toggleSection("Case Studies")}
                  className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-extrabold hover:opacity-70 transition-opacity"
                  style={{ fontSize: '20px', lineHeight: 'normal' }}
                >
                  <span>Case Studies</span>
                  {expandedSections.includes("Case Studies") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedSections.includes("Case Studies") && (
                  <div className="pt-3 pb-4">
                    <div className="space-y-4">
                      {/* Case Study 1 */}
                      <div className="rounded-lg overflow-hidden border border-[#F3F4F6]">
                        <div className="aspect-video bg-gray-200 relative">
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-base text-[#1E2832] mb-1">Skyscraper of London</h4>
                          <p className="text-sm text-[#4D5761] mb-2">Made on 23.02.2024</p>
                          <p className="text-xl font-bold text-[var(--cq-green)]">£300,000</p>
                        </div>
                      </div>

                      {/* Case Study 2 */}
                      <div className="rounded-lg overflow-hidden border border-[#F3F4F6]">
                        <div className="aspect-video bg-gray-200 relative">
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50"></div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-base text-[#1E2832] mb-1">Students Housing in Leeds</h4>
                          <p className="text-sm text-[#4D5761] mb-2">Made on 12.12.2024</p>
                          <p className="text-xl font-bold text-[var(--cq-green)]">£279,000</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proposal Tab Content */}
          {activeTab === "proposal" && (
            <div className="space-y-4">
          {/* Price Section */}
          <div className="border-0">
            <button
              onClick={() => toggleSection("Price")}
              className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: '18px', lineHeight: 'normal' }}
            >
              <span>Price</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold">£{supplier.price.toLocaleString()}</span>
                {expandedSections.includes("Price") ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </button>
            {expandedSections.includes("Price") && (
              <div className="pt-3 pb-4 space-y-2">
                <div className="text-sm text-[#4D5761] flex justify-between">
                  <span>Price Breakdown by other factors</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                  <li>Labour: £21,500</li>
                  <li>Materials: £34,200</li>
                  <li>Health & Safety: £5,800</li>
                  <li>Electrical: £8,150</li>
                  <li>Maintenance: £3,200</li>
                </ul>
                <div className="mt-4 p-3 bg-[#E8F1F8] border border-[#D2E3F2] rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-[#004B75] font-bold text-sm">⚡</span>
                <div>
                      <div className="font-bold text-sm text-[#1E2832]">How do they compare?</div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761] mt-2">
                        <li>Mid-range price, approximately 9% higher than lowest bid from Carraldo Energy</li>
                        <li>Higher cost likely due to extended warranties and Historic Environment England consultation support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="border-0 border-t border-[#F3F4F6] pt-4">
            <button
              onClick={() => toggleSection("Activities")}
              className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: '18px', lineHeight: 'normal' }}
            >
              <span>Activities</span>
              {expandedSections.includes("Activities") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expandedSections.includes("Activities") && (
              <div className="pt-3 pb-4">
                <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                  <li>Includes Historic Environment England consultation support</li>
                  <li>Includes full MCS certification compliance</li>
                  <li>Insurance coverage with £10M public liability included</li>
                </ul>
              </div>
            )}
          </div>

          {/* Further information */}
          <div className="border-0 border-t border-[#F3F4F6] pt-4">
            <button
              onClick={() => toggleSection("Further information")}
              className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: '18px', lineHeight: 'normal' }}
            >
              <span>Further information</span>
              {expandedSections.includes("Further information") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expandedSections.includes("Further information") && (
              <div className="pt-3 pb-4">
                <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                  <li>Total project duration of 48 days</li>
                  <li>Installation period of 7 days</li>
                  <li>Commissioning time of 3 days</li>
                  <li>Preferred start date of November 10, 2025</li>
                </ul>
              </div>
            )}
          </div>

          {/* Maintenance Offering */}
          <div className="border-0 border-t border-[#F3F4F6] pt-4">
            <button
              onClick={() => toggleSection("Maintenance Offering")}
              className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: '18px', lineHeight: 'normal' }}
            >
              <span>Maintenance Offering</span>
              {expandedSections.includes("Maintenance Offering") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expandedSections.includes("Maintenance Offering") && (
              <div className="pt-3 pb-4">
                <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                  <li>Annual maintenance included in price</li>
                  <li>System expected to generate 72,540 kWh annually</li>
                  <li>Export generation estimated at 25,200 kWh annually</li>
                </ul>
              </div>
            )}
          </div>

          {/* Equipment */}
          <div className="border-0 border-t border-[#F3F4F6] pt-4">
            <button
              onClick={() => toggleSection("Equipment")}
              className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: '18px', lineHeight: 'normal' }}
            >
              <span>Equipment</span>
              {expandedSections.includes("Equipment") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expandedSections.includes("Equipment") && (
              <div className="pt-3 pb-4 space-y-4">
                <div>
                  <div className="font-bold text-sm text-[#1E2832] mb-2">Solar Panels</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                    <li>Total System Capacity: 85 kWp</li>
                  </ul>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1E2832] mb-2">Lifespan</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                    <li>No specific degradation standards provided</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Warranty */}
          <div className="border-0 border-t border-[#F3F4F6] pt-4">
            <button
              onClick={() => toggleSection("Warranty")}
              className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: '18px', lineHeight: 'normal' }}
            >
              <span>Warranty</span>
              {expandedSections.includes("Warranty") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expandedSections.includes("Warranty") && (
              <div className="pt-3 pb-4 space-y-4">
                <div>
                  <div className="font-bold text-sm text-[#1E2832] mb-2">Panel Warranty</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                    <li>30 years (Covers defects in materials and workmanship)</li>
                  </ul>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-[#4D5761]">
                    Longest panel warranty among all bidders, exceeding others by 5 years
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1E2832] mb-2">Inverter Warranty</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                    <li>12 years (Covers manufacturing defects and operational issues)</li>
                  </ul>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-[#4D5761]">
                    Highest inverter warranty offered among all bidders
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1E2832] mb-2">Installation Warranty</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                    <li>10 years (Protects against any issues related to installation quality)</li>
                  </ul>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-[#4D5761]">
                    Double the warranty period offered by most other suppliers
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timelines */}
          <div className="border-0 border-t border-[#F3F4F6] pt-4">
            <button
              onClick={() => toggleSection("Timelines")}
              className="w-full py-3 px-0 flex items-center justify-between text-[#1E2832] font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: '18px', lineHeight: 'normal' }}
            >
              <span>Timelines</span>
              {expandedSections.includes("Timelines") ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expandedSections.includes("Timelines") && (
              <div className="pt-3 pb-4 space-y-4">
                <div>
                  <div className="font-bold text-sm text-[#1E2832] mb-2">Delivery time:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#4D5761]">
                    <li>38 days Lead time: 5.4 weeks</li>
                  </ul>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-[#4D5761]">
                    Fastest delivery time among all suppliers, 25% quicker than slowest bidder
              </div>
          </div>
              </div>
            )}
          </div>
            </div>
          )}

        </div>
        </>
      </SheetContent>
    </Sheet>
  )
}








