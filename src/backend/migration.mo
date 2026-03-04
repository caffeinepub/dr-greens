import Map "mo:core/Map";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";

module {
  // Old Types
  type OldProduct = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    unit : Text;
    stock : Nat;
    isActive : Bool;
  };

  type OldOrder = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerName : Text;
    email : Text;
    phone : Text;
    quantity : Nat;
    totalPrice : Float;
    status : Text;
    notes : Text;
    createdAt : Nat64;
  };

  type OldContactSubmission = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
    createdAt : Nat64;
  };

  type OldCustomerProfile = {
    principal : Principal.Principal;
    name : Text;
    email : Text;
    phone : Text;
    location : Text;
    googleMapsLink : Text;
    createdAt : Nat64;
  };

  type OldProducts = Map.Map<Nat, OldProduct>;
  type OldOrders = Map.Map<Nat, OldOrder>;
  type OldContactSubmissions = Map.Map<Nat, OldContactSubmission>;
  type OldCustomerProfiles = Map.Map<Principal.Principal, OldCustomerProfile>;

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    products : OldProducts;
    orders : OldOrders;
    contactSubmissions : OldContactSubmissions;
    customerProfiles : OldCustomerProfiles;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextContactId : Nat;
  };

  // New Types
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    unit : Text;
    stock : Nat;
    isActive : Bool;
  };

  type Order = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerName : Text;
    email : Text;
    phone : Text;
    quantity : Nat;
    totalPrice : Float;
    status : Text;
    notes : Text;
    createdAt : Nat64;
    deliveryDate : Text;
    deliverySlot : Text;
    discount : Float;
  };

  type ContactSubmission = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
    createdAt : Nat64;
  };

  type CustomerProfile = {
    principal : Principal.Principal;
    name : Text;
    email : Text;
    phone : Text;
    location : Text;
    googleMapsLink : Text;
    createdAt : Nat64;
  };

  type Review = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerEmail : Text;
    customerName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Nat64;
  };

  type Banner = {
    id : Nat;
    title : Text;
    description : Text;
    badgeText : Text;
    isActive : Bool;
    createdAt : Nat64;
  };

  type StoreSettings = {
    whatsappNumber : Text;
    businessAddress : Text;
    deliveryZones : Text;
    isStoreOpen : Bool;
    lowStockThreshold : Nat;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  type Products = Map.Map<Nat, Product>;
  type Orders = Map.Map<Nat, Order>;
  type ContactSubmissions = Map.Map<Nat, ContactSubmission>;
  type CustomerProfiles = Map.Map<Principal.Principal, CustomerProfile>;
  type Reviews = Map.Map<Nat, Review>;
  type Banners = Map.Map<Nat, Banner>;
  type UserProfiles = Map.Map<Principal.Principal, UserProfile>;

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    products : Products;
    orders : Orders;
    contactSubmissions : ContactSubmissions;
    customerProfiles : CustomerProfiles;
    reviews : Reviews;
    banners : Banners;
    userProfiles : UserProfiles;
    storeSettings : StoreSettings;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextContactId : Nat;
    nextReviewId : Nat;
    nextBannerId : Nat;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, Order>(
      func(_id, oldOrder) {
        { oldOrder with deliveryDate = ""; deliverySlot = ""; discount = 0.0 };
      }
    );

    {
      accessControlState = old.accessControlState;
      products = old.products;
      orders = newOrders;
      contactSubmissions = old.contactSubmissions;
      customerProfiles = old.customerProfiles;
      reviews = Map.empty<Nat, Review>();
      banners = Map.empty<Nat, Banner>();
      userProfiles = Map.empty<Principal.Principal, UserProfile>();
      storeSettings = {
        whatsappNumber = "";
        businessAddress = "India";
        deliveryZones = "";
        isStoreOpen = true;
        lowStockThreshold = 5;
      };
      nextProductId = old.nextProductId;
      nextOrderId = old.nextOrderId;
      nextContactId = old.nextContactId;
      nextReviewId = 1;
      nextBannerId = 1;
    };
  };
};
