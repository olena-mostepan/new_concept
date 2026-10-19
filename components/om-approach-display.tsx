"use client"

import { Shield, Wrench, BarChart3, CheckCircle2, Phone, AlertCircle, Monitor, FileText, Clock, Users, ArrowRight, Check } from "lucide-react"

interface OMApproachData {
  summary?: {
    title: string
    description: string
  }
  whatsIncluded?: string[]
  monitoringProcess?: Array<{
    phase: string
    action: string
    responsibility: string
  }>
  issueResolution?: {
    steps: Array<{
      number: number
      action: string
      who: string
      customerAction: string | null
    }>
    timeline?: string
  }
  responsibilities?: {
    customer: string[]
    supplier: string[]
  }
  supportFeatures?: Array<{
    icon: string
    title: string
    items: string[]
  }>
}

interface OMApproachDisplayProps {
  text: string
  structuredData?: OMApproachData
}

// Transform dense text into structured data
function parseOMTextToStructured(text: string): OMApproachData {
  const lowerText = text.toLowerCase()
  const data: OMApproachData = {}

  // Extract summary
  const sentences = text.split(/\.\s+(?=[A-Z])/).filter(s => s.trim())
  if (sentences.length > 0) {
    const firstSentence = sentences[0]
    if (firstSentence.length > 20 && !firstSentence.includes(':')) {
      data.summary = {
        title: "Complete Solar Care Package",
        description: firstSentence.substring(0, 150) + (firstSentence.length > 150 ? '...' : '')
      }
    }
  }

  // Extract what's included
  data.whatsIncluded = []
  if (lowerText.includes('cleaning')) {
    data.whatsIncluded.push("Solar panel cleaning (when needed)")
  }
  if (lowerText.includes('24/7') || lowerText.includes('remote monitoring')) {
    data.whatsIncluded.push("24/7 remote monitoring")
  }
  if (lowerText.includes('performance') && lowerText.includes('track')) {
    data.whatsIncluded.push("Real-time performance tracking")
  }
  if (lowerText.includes('alert')) {
    data.whatsIncluded.push("Automatic performance alerts")
  }
  if (lowerText.includes('follow-up') || lowerText.includes('site visit')) {
    data.whatsIncluded.push("Follow-up calls & site visits")
  }
  if (lowerText.includes('support')) {
    data.whatsIncluded.push("Full technical support")
  }

  // Extract monitoring process
  data.monitoringProcess = []
  if (lowerText.includes('commission') || lowerText.includes('activate')) {
    data.monitoringProcess.push({
      phase: "Day 1",
      action: "Remote monitoring activated",
      responsibility: "Supplier"
    })
  }
  if (lowerText.includes('track') || lowerText.includes('compare')) {
    data.monitoringProcess.push({
      phase: "Ongoing",
      action: "Performance tracked vs targets",
      responsibility: "Supplier"
    })
  }
  if (lowerText.includes('alert') || lowerText.includes('trigger')) {
    data.monitoringProcess.push({
      phase: "If issues",
      action: "Automatic alerts triggered",
      responsibility: "Supplier"
    })
  }

  // Extract issue resolution steps
  data.issueResolution = {
    steps: [],
    timeline: "Alert → Diagnose → Fix → Test → Report"
  }

  if (lowerText.includes('alert') || lowerText.includes('issue') || lowerText.includes('detect')) {
    data.issueResolution.steps.push({
      number: 1,
      action: "Issue detected",
      who: "System",
      customerAction: null
    })
  }

  if (lowerText.includes('client') || lowerText.includes('report') || lowerText.includes('notify')) {
    data.issueResolution.steps.push({
      number: 2,
      action: "Customer notified",
      who: "Supplier",
      customerAction: "Acknowledge"
    })
  }

  if (lowerText.includes('diagnose') || lowerText.includes('engineer') || lowerText.includes('investigate')) {
    data.issueResolution.steps.push({
      number: 3,
      action: "Remote diagnosis",
      who: "Engineer",
      customerAction: null
    })
  }

  if (lowerText.includes('repair') || lowerText.includes('fix') || lowerText.includes('technician')) {
    data.issueResolution.steps.push({
      number: 4,
      action: "On-site repair",
      who: "Technician",
      customerAction: "Provide access"
    })
  }

  if (lowerText.includes('test') || lowerText.includes('verify')) {
    data.issueResolution.steps.push({
      number: 5,
      action: "Testing & verification",
      who: "Technician",
      customerAction: null
    })
  }

  if (lowerText.includes('document') || lowerText.includes('report') || lowerText.includes('transparent')) {
    data.issueResolution.steps.push({
      number: 6,
      action: "Completion report",
      who: "Supplier",
      customerAction: "Review & approve"
    })
  }

  // Extract responsibilities
  data.responsibilities = {
    customer: [],
    supplier: []
  }

  if (lowerText.includes('client') && (lowerText.includes('report') || lowerText.includes('procedure'))) {
    data.responsibilities.customer.push("Report visible issues")
  }
  if (lowerText.includes('access') || lowerText.includes('site')) {
    data.responsibilities.customer.push("Provide site access for repairs")
  }
  if (lowerText.includes('review') || lowerText.includes('approve')) {
    data.responsibilities.customer.push("Review completion reports")
  }

  if (lowerText.includes('monitor') || lowerText.includes('24/7')) {
    data.responsibilities.supplier.push("24/7 monitoring")
  }
  if (lowerText.includes('detect') || lowerText.includes('diagnose')) {
    data.responsibilities.supplier.push("Issue detection & diagnosis")
  }
  if (lowerText.includes('repair') || lowerText.includes('maintenance')) {
    data.responsibilities.supplier.push("All repairs & maintenance")
  }
  if (lowerText.includes('optimize') || lowerText.includes('performance')) {
    data.responsibilities.supplier.push("Performance optimization")
  }
  if (lowerText.includes('document') || lowerText.includes('report')) {
    data.responsibilities.supplier.push("Documentation & reporting")
  }

  // Extract support features
  data.supportFeatures = []

  const hasProtection = lowerText.includes('cleaning') || lowerText.includes('monitor') || lowerText.includes('track')
  if (hasProtection) {
    data.supportFeatures.push({
      icon: "🛡️",
      title: "Protection",
      items: [
        lowerText.includes('cleaning') ? "Panel cleaning" : null,
        lowerText.includes('monitor') ? "24/7 monitoring" : null,
        lowerText.includes('track') ? "Performance tracking" : null
      ].filter(Boolean) as string[]
    })
  }

  const hasResponse = lowerText.includes('alert') || lowerText.includes('diagnose') || lowerText.includes('repair')
  if (hasResponse) {
    data.supportFeatures.push({
      icon: "🔧",
      title: "Response",
      items: [
        lowerText.includes('alert') ? "Instant alerts" : null,
        lowerText.includes('diagnose') ? "Remote diagnosis" : null,
        lowerText.includes('repair') ? "Certified repairs" : null
      ].filter(Boolean) as string[]
    })
  }

  const hasReporting = lowerText.includes('report') || lowerText.includes('document') || lowerText.includes('track')
  if (hasReporting) {
    data.supportFeatures.push({
      icon: "📊",
      title: "Reporting",
      items: [
        lowerText.includes('issue') ? "Issue tracking" : null,
        lowerText.includes('performance') ? "Performance reports" : null,
        lowerText.includes('document') ? "Full documentation" : null
      ].filter(Boolean) as string[]
    })
  }

  return data
}

export function OMApproachDisplay({ text, structuredData }: OMApproachDisplayProps) {
  if (!text && !structuredData) return null

  // Use provided structured data or parse from text
  const data = structuredData || parseOMTextToStructured(text)

  return (
    <div className="w-full space-y-6">
      {/* Summary Section */}
      {data.summary && (
        <div className="bg-gradient-to-r from-[var(--cq-green)]/10 to-[var(--cq-green)]/5 rounded-lg p-5 border border-[var(--cq-green)]/20">
          <h3 className="text-lg font-bold text-[#1E2832] mb-2">
            {data.summary.title}
          </h3>
          <p className="text-sm text-[#4D5761] leading-relaxed">
            {data.summary.description}
          </p>
        </div>
      )}

      {/* What's Included Section */}
      {data.whatsIncluded && data.whatsIncluded.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-[#1E2832] mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[var(--cq-green)]" />
            What's Included
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.whatsIncluded.map((item, index) => (
              <div key={index} className="flex items-start gap-2 bg-white border border-[#E5E7EB] rounded-lg p-3">
                <Check className="w-4 h-4 text-[var(--cq-green)] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#4D5761]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Features Grid */}
      {data.supportFeatures && data.supportFeatures.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-[#1E2832] mb-3">
            Support Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.supportFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-[#E5E7EB] rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-[#1E2832] mb-2 text-sm">
                  {feature.title}
                </h4>
                <ul className="space-y-1">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-xs text-[#4D5761] flex items-start gap-1.5">
                      <span className="text-[var(--cq-green)] mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitoring Process */}
      {data.monitoringProcess && data.monitoringProcess.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-[#1E2832] mb-3 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[var(--cq-green)]" />
            Monitoring Process
          </h3>
          <div className="space-y-3">
            {data.monitoringProcess.map((process, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-white border border-[#E5E7EB] rounded-lg p-4"
              >
                <div className="bg-[var(--cq-green)]/10 text-[var(--cq-green)] rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0">
                  {process.phase}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#1E2832] font-medium mb-1">
                    {process.action}
                  </p>
                  <span className="text-xs text-[#4D5761]">
                    {process.responsibility} responsibility
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issue Resolution Steps */}
      {data.issueResolution && data.issueResolution.steps && data.issueResolution.steps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1E2832] flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[var(--cq-green)]" />
              Issue Resolution Process
            </h3>
            {data.issueResolution.timeline && (
              <div className="hidden md:flex items-center gap-2 text-xs text-[#4D5761] bg-[#F9FAFB] px-3 py-1.5 rounded-full border border-[#E5E7EB]">
                <Clock className="w-3 h-3" />
                <span>{data.issueResolution.timeline}</span>
              </div>
            )}
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--cq-green)]/20 hidden md:block" />
            
            <div className="space-y-4">
              {data.issueResolution.steps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-4">
                  <div className="bg-[var(--cq-green)] text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 z-10 font-bold text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1 bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#1E2832] text-sm mb-1">
                          {step.action}
                        </h4>
                        <p className="text-xs text-[#4D5761]">
                          Handled by: <span className="font-medium text-[var(--cq-green)]">{step.who}</span>
                        </p>
                      </div>
                      {step.customerAction && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 flex-shrink-0">
                          <p className="text-xs font-medium text-blue-900 mb-0.5">Your Action</p>
                          <p className="text-xs text-blue-700">{step.customerAction}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Responsibilities Matrix */}
      {data.responsibilities && (
        (data.responsibilities.customer?.length > 0 || data.responsibilities.supplier?.length > 0) && (
          <div>
            <h3 className="text-base font-bold text-[#1E2832] mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--cq-green)]" />
              Responsibilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Responsibilities */}
              {data.responsibilities.customer && data.responsibilities.customer.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Your Responsibility
                  </h4>
                  <ul className="space-y-2">
                    {data.responsibilities.customer.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Supplier Responsibilities */}
              {data.responsibilities.supplier && data.responsibilities.supplier.length > 0 && (
                <div className="bg-[var(--cq-green)]/10 border border-[var(--cq-green)]/20 rounded-lg p-4">
                  <h4 className="font-semibold text-[#1E2832] mb-3 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--cq-green)]" />
                    Our Responsibility
                  </h4>
                  <ul className="space-y-2">
                    {data.responsibilities.supplier.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-[#4D5761]">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--cq-green)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  )
}
