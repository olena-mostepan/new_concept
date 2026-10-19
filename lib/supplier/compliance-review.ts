'use client'

import { useSyncExternalStore } from 'react'
import type { SupplierProfileData } from '@/lib/supplier/profile/types'

/** Insurance, certifications, and financial fields that clear the review flag when edited. */
export const COMPLIANCE_FIELD_KEYS = [
  'professionalIndemnity',
  'qualifications',
  'turnover',
  'teamSize',
  'founded',
  'subcontractors',
  'projectSizes',
  'coverageEntries',
] as const satisfies readonly (keyof SupplierProfileData)[]

export type ComplianceFieldKey = (typeof COMPLIANCE_FIELD_KEYS)[number]

export function isComplianceFieldKey(
  key: keyof SupplierProfileData,
): key is ComplianceFieldKey {
  return (COMPLIANCE_FIELD_KEYS as readonly string[]).includes(key)
}

const SESSION_DISMISS_KEY = 'cq-compliance-banner-dismissed'

/** In-memory org flag (prototype). Seeded true so Overview shows the banner after a prior submit. */
let needsReview = true
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getComplianceNeedsReview(): boolean {
  return needsReview
}

export function setComplianceNeedsReview(value: boolean) {
  if (needsReview === value) return
  needsReview = value
  if (!value && typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_DISMISS_KEY)
    } catch {
      /* ignore */
    }
  }
  emit()
}

/** Call when a tender moves into submitted. */
export function markComplianceNeedsReview() {
  setComplianceNeedsReview(true)
}

/** Call when supplier edits compliance fields or confirms details are still accurate. */
export function clearComplianceNeedsReview() {
  setComplianceNeedsReview(false)
}

export function subscribeComplianceNeedsReview(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useComplianceNeedsReview(): boolean {
  return useSyncExternalStore(
    subscribeComplianceNeedsReview,
    getComplianceNeedsReview,
    getComplianceNeedsReview,
  )
}

export function getComplianceBannerDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function setComplianceBannerDismissed() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
  } catch {
    /* ignore */
  }
  emit()
}

export function useComplianceBannerDismissed(): boolean {
  return useSyncExternalStore(
    subscribeComplianceNeedsReview,
    getComplianceBannerDismissed,
    () => false,
  )
}
