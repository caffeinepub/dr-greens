import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Stats {
    pendingCount: bigint;
    cancelledCount: bigint;
    totalOrders: bigint;
    deliveredCount: bigint;
    totalRevenue: number;
    processingCount: bigint;
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
    productId: bigint;
    productName: string;
    email: string;
    notes: string;
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
export interface ContactSubmission {
    id: bigint;
    name: string;
    createdAt: bigint;
    email: string;
    message: string;
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
    deactivateProduct(id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    exportOrdersCSV(): Promise<string>;
    getAllCustomerProfiles(): Promise<Array<CustomerProfile>>;
    getAllOrders(statusFilter: string | null): Promise<Array<Order>>;
    getCallerUserRole(): Promise<UserRole>;
    getContactSubmissions(): Promise<Array<ContactSubmission>>;
    getMyProfile(): Promise<CustomerProfile | null>;
    getOrderStats(): Promise<Stats>;
    getProductById(id: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(productId: bigint, customerName: string, email: string, phone: string, quantity: bigint, notes: string): Promise<{
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
    submitContactForm(name: string, email: string, phone: string, message: string): Promise<{
        __kind__: "ok";
        ok: bigint;
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
}
