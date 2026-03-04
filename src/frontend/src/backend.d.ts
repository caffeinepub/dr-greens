import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Review {
    id: bigint;
    customerName: string;
    createdAt: bigint;
    productId: bigint;
    productName: string;
    comment: string;
    rating: bigint;
    customerEmail: string;
}
export interface Banner {
    id: bigint;
    title: string;
    badgeText: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
}
export interface ContactSubmission {
    id: bigint;
    name: string;
    createdAt: bigint;
    email: string;
    message: string;
    phone: string;
}
export interface StoreSettings {
    lowStockThreshold: bigint;
    deliveryZones: string;
    businessAddress: string;
    whatsappNumber: string;
    isStoreOpen: boolean;
}
export interface Stats {
    pendingCount: bigint;
    cancelledCount: bigint;
    totalOrders: bigint;
    deliveredCount: bigint;
    totalRevenue: number;
    processingCount: bigint;
    outForDeliveryCount: bigint;
}
export interface CustomerProfile {
    principal: Principal;
    name: string;
    createdAt: bigint;
    googleMapsLink: string;
    email: string;
    phone: string;
    location: string;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    createdAt: bigint;
    deliveryDate: string;
    productId: bigint;
    productName: string;
    deliverySlot: string;
    email: string;
    notes: string;
    discount: number;
    quantity: bigint;
    phone: string;
    totalPrice: number;
}
export interface Product {
    id: bigint;
    name: string;
    unit: string;
    description: string;
    isActive: boolean;
    stock: bigint;
    price: number;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, description: string, price: number, unit: string, stock: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBanner(title: string, description: string, badgeText: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deactivateProduct(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteBanner(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    exportOrdersCSV(): Promise<string>;
    getActiveBanners(): Promise<Array<Banner>>;
    getAllBanners(): Promise<Array<Banner>>;
    getAllCustomerProfiles(): Promise<Array<CustomerProfile>>;
    getAllOrders(statusFilter: string | null): Promise<Array<Order>>;
    getAllReviews(): Promise<Array<Review>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactSubmissions(): Promise<Array<ContactSubmission>>;
    getMyProfile(): Promise<CustomerProfile | null>;
    getOrderStats(): Promise<Stats>;
    getProductById(id: bigint): Promise<Product | null>;
    getProductReviews(productId: bigint): Promise<Array<Review>>;
    getProducts(): Promise<Array<Product>>;
    getStoreSettings(): Promise<StoreSettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(productId: bigint, customerName: string, email: string, phone: string, quantity: bigint, notes: string, deliveryDate: string, deliverySlot: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerCustomerProfile(name: string, email: string, phone: string, location: string, googleMapsLink: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactForm(name: string, email: string, phone: string, message: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitReview(productId: bigint, productName: string, customerEmail: string, customerName: string, rating: bigint, comment: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateBanner(id: bigint, title: string, description: string, badgeText: string, isActive: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateProduct(id: bigint, name: string, description: string, price: number, unit: string, stock: bigint, isActive: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateStoreSettings(whatsappNumber: string, businessAddress: string, deliveryZones: string, isStoreOpen: boolean, lowStockThreshold: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
