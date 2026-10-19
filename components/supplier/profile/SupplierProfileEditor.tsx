'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  clearComplianceNeedsReview,
  isComplianceFieldKey,
  useComplianceNeedsReview,
} from '@/lib/supplier/compliance-review'
import { BEKA_SOLAR_PROFILE, normalizeSupplierProfile } from '@/lib/supplier/profile/mock-data'
import { computeProfileScore } from '@/lib/supplier/profile/scoring'
import type { CoverageEntry, SupplierProfileData } from '@/lib/supplier/profile/types'
import {
  buildReviewSession,
  countReviewItems,
  type ProfileFieldChange,
  type ReviewSession,
} from '@/lib/supplier/profile/review-changes-data'
import { ApplyChangesModal } from '@/components/supplier/profile/ApplyChangesModal'
import { ImproveProfileModal } from '@/components/supplier/profile/ImproveProfileModal'
import { CoverageSection } from '@/components/supplier/profile/CoverageSection'
import { ProfileFieldRow, ProfileSectionCard } from '@/components/supplier/profile/ProfileFieldRow'
import { ProfileCompletenessSidebar } from '@/components/supplier/profile/ProfileCompletenessSidebar'
import { ProfileCompanyHeader } from '@/components/supplier/profile/ProfileCompanyHeader'
import { ProfileNudgeBlock } from '@/components/supplier/profile/ProfileNudgeBlock'
import { VerifyAccountBanner } from '@/components/supplier/profile/VerifyAccountBanner'
import { VerifyAccountModal } from '@/components/supplier/profile/VerifyAccountModal'
import { getIncompleteProfileNudgeItems } from '@/lib/supplier/profile/nudge-items'

type Tab = 'overview' | 'financial' | 'competency'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'financial', label: 'Financial data' },
  { id: 'competency', label: 'Competency' },
]

function parseTabParam(value: string | null): Tab | null {
  if (value === 'overview' || value === 'financial' || value === 'competency') {
    return value
  }
  return null
}

function applyFieldChange(
  profile: SupplierProfileData,
  change: ProfileFieldChange,
  value: string,
): SupplierProfileData {
  if (!change.fieldKey) return profile
  return {
    ...profile,
    [change.fieldKey]: {
      value,
      status: 'verified',
    },
  }
}

function ComplianceConfirmBanner({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-cq-border bg-cq-bg/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-cq-text">
          Confirm your compliance details
        </p>
        <p className="mt-0.5 text-sm text-cq-text-secondary">
          Insurance, certifications, and financials are shown to clients with
          your bid. If nothing has changed, you can confirm them as still
          accurate.
        </p>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="btn-secondary-sm shrink-0"
      >
        Confirm details are still accurate
      </button>
    </div>
  )
}

export function SupplierProfileEditor() {
  const [profile, setProfile] = React.useState<SupplierProfileData>(() =>
    normalizeSupplierProfile(BEKA_SOLAR_PROFILE),
  )
  const [tab, setTab] = React.useState<Tab>('overview')
  const [applyOpen, setApplyOpen] = React.useState(false)
  const [verifyOpen, setVerifyOpen] = React.useState(false)
  const [improveOpen, setImproveOpen] = React.useState(false)
  const [reviewSession, setReviewSession] = React.useState<ReviewSession | null>(null)
  const [accountVerified, setAccountVerified] = React.useState(false)
  const complianceNeedsReview = useComplianceNeedsReview()
  const sessionStartScore = React.useRef(computeProfileScore(BEKA_SOLAR_PROFILE).overall)
  const profileRef = React.useRef(profile)
  profileRef.current = profile

  React.useEffect(() => {
    const fromUrl = parseTabParam(
      new URLSearchParams(window.location.search).get('tab'),
    )
    if (fromUrl) setTab(fromUrl)
  }, [])

  const pendingChangeCount = reviewSession ? countReviewItems(reviewSession) : 0
  const score = React.useMemo(() => computeProfileScore(profile), [profile])
  const scoreDelta = Math.max(0, score.overall - sessionStartScore.current)
  const nudgeItems = React.useMemo(() => getIncompleteProfileNudgeItems(profile), [profile])

  const handleNudgeNavigate = (href: string) => {
    if (href.includes('competency')) {
      setTab('competency')
      return
    }
    if (href.includes('business-info')) {
      setTab('financial')
    }
  }

  const handleSidebarAction = () => {
    if (!accountVerified) {
      if (pendingChangeCount > 0) {
        setApplyOpen(true)
      } else {
        setVerifyOpen(true)
      }
      return
    }
    if (pendingChangeCount > 0) {
      setApplyOpen(true)
      return
    }
    setImproveOpen(true)
  }

  const handleExtractComplete = (sourceDocument: string) => {
    setReviewSession(buildReviewSession(profileRef.current, sourceDocument))
    setApplyOpen(true)
  }

  const handleUpload = (files: FileList) => {
    const newDocs = Array.from(files).map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      filename: file.name,
      type: file.type.startsWith('image/')
        ? ('image' as const)
        : file.name.endsWith('.pdf')
          ? ('pdf' as const)
          : ('other' as const),
      uploadedAt: new Date().toISOString().slice(0, 10),
      extracted: /\.(pdf|doc|docx|xls|xlsx|csv|txt)$/i.test(file.name),
    }))
    setProfile((p) => ({ ...p, documents: [...p.documents, ...newDocs] }))
  }

  const handleApplyChanges = ({
    fieldChanges,
    caseStudyIds,
    values,
  }: {
    fieldChanges: ProfileFieldChange[]
    caseStudyIds: string[]
    values: Record<string, string>
  }) => {
    if (!reviewSession) return

    let touchedCompliance = false
    setProfile((p) => {
      let next = { ...p }
      for (const change of fieldChanges) {
        if (change.fieldKey && isComplianceFieldKey(change.fieldKey)) {
          touchedCompliance = true
        }
        next = applyFieldChange(next, change, values[change.id] ?? change.suggestedValue)
      }
      if (caseStudyIds.length > 0) {
        const labels = reviewSession.caseStudies
          .filter((cs) => caseStudyIds.includes(cs.id))
          .map((cs) => cs.fields.find((f) => f.label === 'Organisation')?.value ?? cs.id)
        next = {
          ...next,
          caseStudies: { value: labels, status: 'verified' as const },
        }
      }
      return next
    })
    if (touchedCompliance) clearComplianceNeedsReview()
    setReviewSession(null)
    setAccountVerified(true)
  }

  const handleCoverageChange = (entries: CoverageEntry[]) => {
    setProfile((p) => ({
      ...p,
      coverageEntries: { value: entries, status: 'verified' },
    }))
    clearComplianceNeedsReview()
  }

  return (
    <>
      <ProfileCompanyHeader profile={profile} verified={accountVerified} />

      <div className="border-b border-cq-border bg-white">
        <div className="mx-auto flex max-w-screen-2xl gap-6 px-6 sm:px-8 lg:px-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px border-b-2 px-1 py-4 text-sm font-semibold transition-colors',
                tab === t.id
                  ? 'border-[var(--cq-green)] text-cq-text'
                  : 'border-transparent text-cq-text-secondary hover:text-cq-text',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 py-8 sm:px-8 lg:px-10">
        {!accountVerified && (
          <VerifyAccountBanner onVerify={() => setVerifyOpen(true)} />
        )}

        {complianceNeedsReview ? (
          <ComplianceConfirmBanner
            onConfirm={() => {
              clearComplianceNeedsReview()
            }}
          />
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-6">
            {tab === 'overview' && (
              <>
                <ProfileNudgeBlock items={nudgeItems} onNavigate={handleNudgeNavigate} />

                <ProfileSectionCard title="Company Details">
                  <ProfileFieldRow label="Company Name" field={profile.companyName} />
                  <ProfileFieldRow label="Reg. Number" field={profile.regNumber} />
                  <ProfileFieldRow
                    label="Website"
                    field={profile.website}
                    renderValue={(v) =>
                      v ? (
                        <a
                          href={String(v)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[var(--cq-green)] hover:underline"
                        >
                          {String(v)}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <ProfileFieldRow label="Address" field={profile.address} />
                  <ProfileFieldRow
                    label="Logo"
                    field={profile.logoUrl}
                    renderValue={(v) =>
                      v ? (
                        <img
                          src={String(v)}
                          alt="Company logo"
                          className="h-10 w-10 rounded object-contain"
                        />
                      ) : (
                        <span className="font-semibold text-[var(--cq-green)]">Replace</span>
                      )
                    }
                  />
                </ProfileSectionCard>

                <ProfileSectionCard title="Company Description">
                  <ProfileFieldRow label="Director Name" field={profile.directorName} />
                  <ProfileFieldRow label="Director Title" field={profile.directorTitle} />
                  <ProfileFieldRow
                    label="Director Photo"
                    field={profile.directorPhotoUrl}
                    renderValue={(v) =>
                      v ? (
                        <img
                          src={String(v)}
                          alt="Director"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-[var(--cq-green)]">Replace</span>
                      )
                    }
                  />
                </ProfileSectionCard>
              </>
            )}

            {tab === 'financial' && (
              <>
                <ProfileSectionCard title="Business Info">
                  <ProfileFieldRow label="Professional Indemnity" field={profile.professionalIndemnity} />
                  <ProfileFieldRow label="Team Size" field={profile.teamSize} />
                  <ProfileFieldRow label="Founded" field={profile.founded} />
                  <ProfileFieldRow label="Turnover" field={profile.turnover} />
                  <ProfileFieldRow label="Subcontractors" field={profile.subcontractors} />
                  <ProfileFieldRow label="Project Sizes" field={profile.projectSizes} />
                </ProfileSectionCard>

                <CoverageSection
                  field={profile.coverageEntries ?? { value: [], status: 'empty' }}
                  onChange={handleCoverageChange}
                />
              </>
            )}

            {tab === 'competency' && (
              <>
                <ProfileSectionCard title="Solution Types">
                  <ProfileFieldRow label="Solution Types" field={profile.solutionTypes} />
                </ProfileSectionCard>
                <ProfileSectionCard title="Qualifications">
                  <ProfileFieldRow label="Qualifications" field={profile.qualifications} />
                </ProfileSectionCard>
                <ProfileSectionCard title="Case Studies">
                  <ProfileFieldRow label="Case Studies" field={profile.caseStudies} />
                </ProfileSectionCard>
              </>
            )}
          </div>

          <ProfileCompletenessSidebar
            score={score}
            pendingChangeCount={pendingChangeCount}
            scoreDelta={scoreDelta}
            accountVerified={accountVerified}
            onAction={handleSidebarAction}
          />
        </div>
      </div>

      <VerifyAccountModal
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        profile={profile}
        documents={profile.documents}
        onUpload={handleUpload}
        onExtractComplete={handleExtractComplete}
      />

      <ApplyChangesModal
        open={applyOpen}
        onOpenChange={setApplyOpen}
        session={reviewSession}
        onApply={handleApplyChanges}
      />

      <ImproveProfileModal
        open={improveOpen}
        onOpenChange={setImproveOpen}
        documents={profile.documents}
        onUpload={handleUpload}
        onExtractComplete={handleExtractComplete}
      />
    </>
  )
}
