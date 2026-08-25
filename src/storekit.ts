import { Capacitor, registerPlugin } from '@capacitor/core'

interface StoreKitPlugin {
  checkEntitlements(): Promise<{ isLicensed: boolean }>
  getProducts(): Promise<{ products: Array<{ id: string; displayName: string; description: string; price: string; type: string }> }>
  purchase(options: { productId: string }): Promise<{ success: boolean; cancelled?: boolean; pending?: boolean; productId?: string }>
  restorePurchases(): Promise<{ restored: boolean }>
  requestReview(): Promise<void>
}

const StoreKit = registerPlugin<StoreKitPlugin>('StoreKit')

export const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'

export async function checkStoreKitEntitlements(): Promise<boolean> {
  try {
    const { isLicensed } = await StoreKit.checkEntitlements()
    return isLicensed
  } catch {
    return false
  }
}

export async function getProducts() {
  const { products } = await StoreKit.getProducts()
  return products
}

export async function purchaseProduct(productId: string) {
  return StoreKit.purchase({ productId })
}

export async function restorePurchases(): Promise<boolean> {
  const { restored } = await StoreKit.restorePurchases()
  return restored
}

const FIRST_OPEN_KEY = 'lg_first_open'
const REVIEW_REQUESTED_KEY = 'lg_review_requested'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function maybeRequestReview(): void {
  if (!isNativeIOS) return
  try {
    // Record first open date if not already set
    if (!localStorage.getItem(FIRST_OPEN_KEY)) {
      localStorage.setItem(FIRST_OPEN_KEY, Date.now().toString())
    }
    // Don't ask again if already requested
    if (localStorage.getItem(REVIEW_REQUESTED_KEY)) return
    const firstOpen = parseInt(localStorage.getItem(FIRST_OPEN_KEY) || '0', 10)
    if (Date.now() - firstOpen >= SEVEN_DAYS_MS) {
      localStorage.setItem(REVIEW_REQUESTED_KEY, '1')
      StoreKit.requestReview().catch(() => {})
    }
  } catch {
    // Silently ignore — review request is non-critical
  }
}

export default StoreKit
