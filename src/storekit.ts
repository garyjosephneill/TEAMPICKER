import { Capacitor, registerPlugin } from '@capacitor/core'

interface StoreKitPlugin {
  checkEntitlements(): Promise<{ isLicensed: boolean }>
  getProducts(): Promise<{ products: Array<{ id: string; displayName: string; description: string; price: string; type: string }> }>
  purchase(options: { productId: string }): Promise<{ success: boolean; cancelled?: boolean; pending?: boolean; productId?: string }>
  restorePurchases(): Promise<{ restored: boolean }>
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

export default StoreKit
