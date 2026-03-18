import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkEntitlements", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
    ]

    private let productIds: Set<String> = [
        "com.garyjosephneill.lazygaffer.annual",
        "com.garyjosephneill.lazygaffer.lifetime"
    ]

    @objc func checkEntitlements(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else { call.resolve(["isLicensed": false]); return }
        Task {
            var isLicensed = false
            for await result in Transaction.currentEntitlements {
                if case .verified(let transaction) = result {
                    if self.productIds.contains(transaction.productID) {
                        isLicensed = true
                        break
                    }
                }
            }
            call.resolve(["isLicensed": isLicensed])
        }
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else { call.reject("iOS 15+ required"); return }
        Task {
            do {
                let products = try await Product.products(for: productIds)
                let productData: [[String: Any]] = products.map { product in
                    return [
                        "id": product.id,
                        "displayName": product.displayName,
                        "description": product.description,
                        "price": product.displayPrice,
                        "type": product.type == .autoRenewable ? "subscription" : "lifetime"
                    ]
                }
                call.resolve(["products": productData])
            } catch {
                call.reject("Failed to fetch products: \(error.localizedDescription)")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else { call.reject("iOS 15+ required"); return }
        guard let productId = call.getString("productId") else {
            call.reject("productId required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        call.resolve(["success": true, "productId": transaction.productID])
                    case .unverified:
                        call.reject("Purchase verification failed")
                    }
                case .pending:
                    call.resolve(["success": false, "pending": true])
                case .userCancelled:
                    call.resolve(["success": false, "cancelled": true])
                @unknown default:
                    call.reject("Unknown purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else { call.resolve(["restored": false]); return }
        Task {
            var restored = false
            for await result in Transaction.currentEntitlements {
                if case .verified(let transaction) = result {
                    if self.productIds.contains(transaction.productID) {
                        await transaction.finish()
                        restored = true
                    }
                }
            }
            call.resolve(["restored": restored])
        }
    }
}
