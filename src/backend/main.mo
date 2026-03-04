import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Bool "mo:core/Bool";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Types ──────────────────────────────────────────────────────────────────
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    unit : Text;
    stock : Nat;
    isActive : Bool;
  };

  public type Order = {
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

  public type ContactSubmission = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
    createdAt : Nat64;
  };

  public type Stats = {
    totalOrders : Nat;
    totalRevenue : Float;
    pendingCount : Nat;
    processingCount : Nat;
    deliveredCount : Nat;
    cancelledCount : Nat;
    outForDeliveryCount : Nat;
  };

  public type CustomerProfile = {
    principal : Principal;
    name : Text;
    email : Text;
    phone : Text;
    location : Text;
    googleMapsLink : Text;
    createdAt : Nat64;
  };

  public type Review = {
    id : Nat;
    productId : Nat;
    productName : Text;
    customerEmail : Text;
    customerName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Nat64;
  };

  public type Banner = {
    id : Nat;
    title : Text;
    description : Text;
    badgeText : Text;
    isActive : Bool;
    createdAt : Nat64;
  };

  public type StoreSettings = {
    whatsappNumber : Text;
    businessAddress : Text;
    deliveryZones : Text;
    isStoreOpen : Bool;
    lowStockThreshold : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  // ── State ──────────────────────────────────────────────────────────────────
  type OldProducts = Map.Map<Nat, Product>;
  type OldOrders = Map.Map<Nat, Order>;
  type OldContactSubmissions = Map.Map<Nat, ContactSubmission>;
  type OldCustomerProfiles = Map.Map<Principal, CustomerProfile>;

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

  var nextProductId : Nat = 7;
  var nextOrderId : Nat = 1;
  var nextContactId : Nat = 1;
  var nextReviewId : Nat = 1;
  var nextBannerId : Nat = 1;

  let products : Map.Map<Nat, Product> = Map.empty<Nat, Product>();
  let orders : Map.Map<Nat, Order> = Map.empty<Nat, Order>();
  let contactSubmissions : Map.Map<Nat, ContactSubmission> = Map.empty<Nat, ContactSubmission>();
  let customerProfiles : Map.Map<Principal, CustomerProfile> = Map.empty<Principal, CustomerProfile>();
  let reviews : Map.Map<Nat, Review> = Map.empty<Nat, Review>();
  let banners : Map.Map<Nat, Banner> = Map.empty<Nat, Banner>();
  let userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();

  var storeSettings : StoreSettings = {
    whatsappNumber = "";
    businessAddress = "India";
    deliveryZones = "";
    isStoreOpen = true;
    lowStockThreshold = 5;
  };

  // ── Seed data ──────────────────────────────────────────────────────────────
  do {
    products.add(
      1,
      {
        id = 1;
        name = "Sunflower Shoots";
        description = "Tender and nutty, perfect on salads and sandwiches. Rich in vitamins E and B.";
        price = 85.0;
        unit = "per tray";
        stock = 20;
        isActive = true;
      },
    );
    products.add(
      2,
      {
        id = 2;
        name = "Pea Shoots";
        description = "Sweet and crisp with a fresh garden flavour. High in vitamins C and A.";
        price = 70.0;
        unit = "per tray";
        stock = 25;
        isActive = true;
      },
    );
    products.add(
      3,
      {
        id = 3;
        name = "Radish Microgreens";
        description = "Spicy and peppery bite. Excellent source of antioxidants and folate.";
        price = 65.0;
        unit = "per tray";
        stock = 30;
        isActive = true;
      },
    );
    products.add(
      4,
      {
        id = 4;
        name = "Broccoli Microgreens";
        description = "Mild and earthy. Loaded with sulforaphane and cancer-fighting compounds.";
        price = 75.0;
        unit = "per tray";
        stock = 20;
        isActive = true;
      },
    );
    products.add(
      5,
      {
        id = 5;
        name = "Wheatgrass";
        description = "Earthy and grassy superfood. Packed with chlorophyll, iron and antioxidants.";
        price = 60.0;
        unit = "per tray";
        stock = 15;
        isActive = true;
      },
    );
    products.add(
      6,
      {
        id = 6;
        name = "Sunflower and Pea Mix";
        description = "A sweet and nutty blend combining the best of both worlds. Our most popular mix.";
        price = 90.0;
        unit = "per tray";
        stock = 18;
        isActive = true;
      },
    );
  };

  // ── User Profile Functions ────────────────────────────────────────────────
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Public queries ─────────────────────────────────────────────────────────
  public query func getProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.isActive });
  };

  public query func getProductById(id : Nat) : async ?Product {
    products.get(id);
  };

  // ── Place order ────────────────────────────────────────────────────────────
  public shared ({ caller }) func placeOrder(
    productId : Nat,
    customerName : Text,
    email : Text,
    phone : Text,
    quantity : Nat,
    notes : Text,
    deliveryDate : Text,
    deliverySlot : Text,
  ) : async { #ok : Nat; #err : Text } {
    // Check if caller is not anonymous
    if (caller.isAnonymous()) {
      return #err("Anonymous users are forbidden from placing orders. Please log in first.");
    };
    if (quantity == 0) { return #err("Quantity must be at least 1") };
    switch (products.get(productId)) {
      case (null) { #err("Product not found") };
      case (?p) {
        if (not p.isActive) { return #err("Product is not available") };
        if (p.stock < quantity) { return #err("Insufficient stock. Available: " # p.stock.toText()) };
        products.add(
          productId,
          {
            id = p.id;
            name = p.name;
            description = p.description;
            price = p.price;
            unit = p.unit;
            isActive = p.isActive;
            stock = p.stock - quantity;
          },
        );

        let discount = if (quantity >= 5) {
          15.0;
        } else if (quantity >= 3) {
          10.0;
        } else {
          0.0;
        };

        let oid = nextOrderId;
        nextOrderId += 1;
        orders.add(
          oid,
          {
            id = oid;
            productId;
            productName = p.name;
            customerName;
            email;
            phone;
            quantity;
            totalPrice = p.price * quantity.toFloat() * (1.0 - (discount / 100.0));
            status = "pending";
            notes;
            createdAt = Nat64.fromIntWrap(Time.now() / 1_000_000);
            deliveryDate;
            deliverySlot;
            discount;
          },
        );
        #ok(oid);
      };
    };
  };

  // ── Contact Submission ─────────────────────────────────────────────────────
  public shared ({ caller }) func submitContactForm(
    name : Text,
    email : Text,
    phone : Text,
    message : Text,
  ) : async { #ok : Nat; #err : Text } {
    // Anyone can submit contact form, including anonymous users
    if (name.size() == 0 or email.size() == 0 or message.size() == 0) {
      return #err("Name, email, and message are required");
    };
    let id = nextContactId;
    nextContactId += 1;
    contactSubmissions.add(
      id,
      {
        id;
        name;
        email;
        phone;
        message;
        createdAt = Nat64.fromIntWrap(Time.now() / 1_000_000);
      },
    );
    #ok(id);
  };

  public query ({ caller }) func getContactSubmissions() : async [ContactSubmission] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view contact submissions");
    };
    contactSubmissions.values().toArray();
  };

  // ── Admin queries ──────────────────────────────────────────────────────────
  public query ({ caller }) func getAllOrders(statusFilter : ?Text) : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    let all = orders.values().toArray();
    switch (statusFilter) {
      case (null) { all };
      case (?s) {
        all.filter(
          func(o) { o.status == s }
        );
      };
    };
  };

  public query ({ caller }) func getOrderStats() : async Stats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view order statistics");
    };
    var total = 0;
    var rev = 0.0;
    var pend = 0;
    var proc = 0;
    var deliv = 0;
    var canc = 0;
    var outForDelivery = 0;
    for (o in orders.values()) {
      total += 1;
      rev += o.totalPrice;
      if (o.status == "pending") { pend += 1 } else if (o.status == "processing") { proc += 1 } else if (o.status == "delivered") { deliv += 1 } else if (o.status == "cancelled") { canc += 1 } else if (o.status == "out-for-delivery") { outForDelivery += 1 };
    };
    {
      totalOrders = total;
      totalRevenue = rev;
      pendingCount = pend;
      processingCount = proc;
      deliveredCount = deliv;
      cancelledCount = canc;
      outForDeliveryCount = outForDelivery;
    };
  };

  public query ({ caller }) func exportOrdersCSV() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can export orders");
    };
    var csv = "Order ID,Product,Customer,Email,Phone,Qty,Total (R),Status,Notes,Date,Delivery Date,Delivery Slot,Discount\n";
    for (o in orders.values()) {
      csv #= o.id.toText() # "," # o.productName # "," # o.customerName # "," # o.email # "," # o.phone # "," # o.quantity.toText() # "," # o.totalPrice.toText() # "," # o.status # "," # "\"" # o.notes # "\"" # "," # o.createdAt.toText() # "," # o.deliveryDate # "," # o.deliverySlot # "," # o.discount.toText() # "\n";
    };
    csv;
  };

  // ── Admin updates ──────────────────────────────────────────────────────────
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : Text) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { #err("Order not found") };
      case (?o) {
        orders.add(
          orderId,
          {
            id = o.id;
            productId = o.productId;
            productName = o.productName;
            customerName = o.customerName;
            email = o.email;
            phone = o.phone;
            quantity = o.quantity;
            totalPrice = o.totalPrice;
            notes = o.notes;
            createdAt = o.createdAt;
            status = newStatus;
            deliveryDate = o.deliveryDate;
            deliverySlot = o.deliverySlot;
            discount = o.discount;
          },
        );
        #ok;
      };
    };
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    description : Text,
    price : Float,
    unit : Text,
    stock : Nat,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = nextProductId;
    nextProductId += 1;
    products.add(id, { id; name; description; price; unit; stock; isActive = true });
    id;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    description : Text,
    price : Float,
    unit : Text,
    stock : Nat,
    isActive : Bool,
  ) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { #err("Product not found") };
      case (?_) {
        products.add(id, { id; name; description; price; unit; stock; isActive });
        #ok;
      };
    };
  };

  public shared ({ caller }) func deactivateProduct(id : Nat) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can deactivate products");
    };
    switch (products.get(id)) {
      case (null) { #err("Product not found") };
      case (?p) {
        products.add(
          id,
          {
            id = p.id;
            name = p.name;
            description = p.description;
            price = p.price;
            unit = p.unit;
            stock = p.stock;
            isActive = false;
          },
        );
        #ok;
      };
    };
  };

  // ── Customer Profile ───────────────────────────────────────────────────────
  public shared ({ caller }) func registerCustomerProfile(
    name : Text,
    email : Text,
    phone : Text,
    location : Text,
    googleMapsLink : Text,
  ) : async { #ok; #err : Text } {
    if (caller.isAnonymous()) {
      return #err("Anonymous caller is not allowed to register a customer profile");
    };
    if (name.size() == 0 or email.size() == 0 or phone.size() == 0 or location.size() == 0) {
      return #err("Name, email, phone, and location are required");
    };
    let createdAt = Nat64.fromIntWrap(Time.now() / 1_000_000);
    let profile = {
      principal = caller;
      name;
      email;
      phone;
      location;
      googleMapsLink;
      createdAt;
    };
    customerProfiles.add(caller, profile);
    #ok;
  };

  public query ({ caller }) func getMyProfile() : async ?CustomerProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access profiles");
    };
    customerProfiles.get(caller);
  };

  public query ({ caller }) func getAllCustomerProfiles() : async [CustomerProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all customer profiles");
    };
    customerProfiles.values().toArray();
  };

  // ── Reviews ────────────────────────────────────────────────────────────────
  public shared ({ caller }) func submitReview(
    productId : Nat,
    productName : Text,
    customerEmail : Text,
    customerName : Text,
    rating : Nat,
    comment : Text,
  ) : async { #ok : Nat; #err : Text } {
    if (caller.isAnonymous()) {
      return #err("Anonymous users are not allowed to submit reviews. Please log in first.");
    };
    if (rating < 1 or rating > 5) { return #err("Rating must be between 1 and 5") };
    let id = nextReviewId;
    nextReviewId += 1;
    reviews.add(
      id,
      {
        id;
        productId;
        productName;
        customerEmail;
        customerName;
        rating;
        comment;
        createdAt = Nat64.fromIntWrap(Time.now() / 1_000_000);
      },
    );
    #ok(id);
  };

  public query func getProductReviews(productId : Nat) : async [Review] {
    reviews.values().toArray().filter(func(r) { r.productId == productId });
  };

  public query ({ caller }) func getAllReviews() : async [Review] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access all reviews");
    };
    reviews.values().toArray();
  };

  // ── Banners ────────────────────────────────────────────────────────────────
  public shared ({ caller }) func createBanner(
    title : Text,
    description : Text,
    badgeText : Text,
  ) : async { #ok : Nat; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create banners");
    };
    let id = nextBannerId;
    nextBannerId += 1;
    banners.add(
      id,
      {
        id;
        title;
        description;
        badgeText;
        isActive = true;
        createdAt = Nat64.fromIntWrap(Time.now() / 1_000_000);
      },
    );
    #ok(id);
  };

  public shared ({ caller }) func updateBanner(
    id : Nat,
    title : Text,
    description : Text,
    badgeText : Text,
    isActive : Bool,
  ) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update banners");
    };
    switch (banners.get(id)) {
      case (null) { #err("Banner not found") };
      case (?_) {
        banners.add(
          id,
          {
            id;
            title;
            description;
            badgeText;
            isActive;
            createdAt = Nat64.fromIntWrap(Time.now() / 1_000_000);
          },
        );
        #ok;
      };
    };
  };

  public shared ({ caller }) func deleteBanner(id : Nat) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete banners");
    };
    switch (banners.get(id)) {
      case (null) { #err("Banner not found") };
      case (?_) {
        banners.remove(id);
        #ok;
      };
    };
  };

  public query func getActiveBanners() : async [Banner] {
    banners.values().toArray().filter(func(b) { b.isActive });
  };

  public query ({ caller }) func getAllBanners() : async [Banner] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access all banners");
    };
    banners.values().toArray();
  };

  // ── Store Settings ─────────────────────────────────────────────────────────
  public query func getStoreSettings() : async StoreSettings {
    storeSettings;
  };

  public shared ({ caller }) func updateStoreSettings(
    whatsappNumber : Text,
    businessAddress : Text,
    deliveryZones : Text,
    isStoreOpen : Bool,
    lowStockThreshold : Nat,
  ) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update store settings");
    };
    storeSettings := {
      whatsappNumber;
      businessAddress;
      deliveryZones;
      isStoreOpen;
      lowStockThreshold;
    };
    #ok;
  };
};
