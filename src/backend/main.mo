import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
actor {

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Types ──────────────────────────────────────────────────────────────────

  public type Product = {
    id          : Nat;
    name        : Text;
    description : Text;
    price       : Float;
    unit        : Text;
    stock       : Nat;
    isActive    : Bool;
  };

  public type Order = {
    id           : Nat;
    productId    : Nat;
    productName  : Text;
    customerName : Text;
    email        : Text;
    phone        : Text;
    quantity     : Nat;
    totalPrice   : Float;
    status       : Text;
    notes        : Text;
    createdAt    : Nat64;
  };

  public type ContactSubmission = {
    id        : Nat;
    name      : Text;
    email     : Text;
    phone     : Text;
    message   : Text;
    createdAt : Nat64;
  };

  public type Stats = {
    totalOrders     : Nat;
    totalRevenue    : Float;
    pendingCount    : Nat;
    processingCount : Nat;
    deliveredCount  : Nat;
    cancelledCount  : Nat;
  };

  // ── State ──────────────────────────────────────────────────────────────────

  var nextProductId     : Nat = 7;
  var nextOrderId       : Nat = 1;
  var nextContactId     : Nat = 1;

  let products          : Map.Map<Nat, Product> = Map.empty<Nat, Product>();
  let orders            : Map.Map<Nat, Order> = Map.empty<Nat, Order>();
  let contactSubmissions: Map.Map<Nat, ContactSubmission> = Map.empty<Nat, ContactSubmission>();

  // ── Seed data ──────────────────────────────────────────────────────────────

  do {
    products.add(1, { id = 1; name = "Sunflower Shoots";     description = "Tender and nutty, perfect on salads and sandwiches. Rich in vitamins E and B.";   price = 85.0; unit = "per tray"; stock = 20; isActive = true });
    products.add(2, { id = 2; name = "Pea Shoots";           description = "Sweet and crisp with a fresh garden flavour. High in vitamins C and A.";            price = 70.0; unit = "per tray"; stock = 25; isActive = true });
    products.add(3, { id = 3; name = "Radish Microgreens";   description = "Spicy and peppery bite. Excellent source of antioxidants and folate.";               price = 65.0; unit = "per tray"; stock = 30; isActive = true });
    products.add(4, { id = 4; name = "Broccoli Microgreens"; description = "Mild and earthy. Loaded with sulforaphane and cancer-fighting compounds.";            price = 75.0; unit = "per tray"; stock = 20; isActive = true });
    products.add(5, { id = 5; name = "Wheatgrass";           description = "Earthy and grassy superfood. Packed with chlorophyll, iron and antioxidants.";       price = 60.0; unit = "per tray"; stock = 15; isActive = true });
    products.add(6, { id = 6; name = "Sunflower and Pea Mix"; description = "A sweet and nutty blend combining the best of both worlds. Our most popular mix."; price = 90.0; unit = "per tray"; stock = 18; isActive = true });
  };

  // ── Public queries ─────────────────────────────────────────────────────────

  public query func getProducts() : async [Product] {
    products.values().toArray().filter(func(p : Product) : Bool { p.isActive })
  };

  public query func getProductById(id : Nat) : async ?Product {
    products.get(id)
  };

  // ── Place order ────────────────────────────────────────────────────────────

  public shared ({ caller }) func placeOrder(
    productId    : Nat,
    customerName : Text,
    email        : Text,
    phone        : Text,
    quantity     : Nat,
    notes        : Text
  ) : async { #ok : Nat; #err : Text } {
    // Check if caller is not anonymous
    if (caller.isAnonymous()) {
      return #err("Anonymous users are forbidden from placing orders. Please log in first.");
    };
    if (quantity == 0) { return #err("Quantity must be at least 1") };
    switch (products.get(productId)) {
      case (null) { #err("Product not found") };
      case (?p) {
        if (not p.isActive)    { return #err("Product is not available") };
        if (p.stock < quantity){ return #err("Insufficient stock. Available: " # p.stock.toText()) };
        products.add(productId, {
          id = p.id; name = p.name; description = p.description;
          price = p.price; unit = p.unit; isActive = p.isActive;
          stock = p.stock - quantity;
        });
        let oid = nextOrderId;
        nextOrderId += 1;
        orders.add(oid, {
          id           = oid;
          productId;
          productName  = p.name;
          customerName;
          email;
          phone;
          quantity;
          totalPrice   = p.price * quantity.toFloat();
          status       = "pending";
          notes;
          createdAt    = Prim.time() / 1_000_000;
        });
        #ok(oid)
      };
    }
  };

  // ── Contact Submission ─────────────────────────────────────────────────────

  public shared ({ caller }) func submitContactForm(
    name    : Text,
    email   : Text,
    phone   : Text,
    message : Text
  ) : async { #ok : Nat; #err : Text } {
    // Anyone can submit contact form, including anonymous users
    if (name.size() == 0 or email.size() == 0 or message.size() == 0) {
      return #err("Name, email, and message are required");
    };
    let id = nextContactId;
    nextContactId += 1;
    contactSubmissions.add(id, {
      id;
      name;
      email;
      phone;
      message;
      createdAt = Prim.time() / 1_000_000;
    });
    #ok(id)
  };

  public query ({ caller }) func getContactSubmissions() : async [ContactSubmission] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view contact submissions");
    };
    contactSubmissions.values().toArray()
  };

  // ── Admin queries ──────────────────────────────────────────────────────────

  public query ({ caller }) func getAllOrders(statusFilter : ?Text) : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    let all = orders.values().toArray();
    switch statusFilter {
      case (null) { all };
      case (?s)   { all.filter(func(o : Order) : Bool { o.status == s }) };
    }
  };

  public query ({ caller }) func getOrderStats() : async Stats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view order statistics");
    };
    var total = 0; var rev = 0.0;
    var pend = 0; var proc = 0; var deliv = 0; var canc = 0;
    for (o in orders.values()) {
      total += 1;
      rev   += o.totalPrice;
      if      (o.status == "pending")    { pend  += 1 }
      else if (o.status == "processing") { proc  += 1 }
      else if (o.status == "delivered")  { deliv += 1 }
      else if (o.status == "cancelled")  { canc  += 1 };
    };
    { totalOrders = total; totalRevenue = rev;
      pendingCount = pend; processingCount = proc;
      deliveredCount = deliv; cancelledCount = canc }
  };

  public query ({ caller }) func exportOrdersCSV() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can export orders");
    };
    var csv = "Order ID,Product,Customer,Email,Phone,Qty,Total (R),Status,Notes,Date\n";
    for (o in orders.values()) {
      csv #= o.id.toText() # ","
          # o.productName # ","
          # o.customerName # ","
          # o.email # ","
          # o.phone # ","
          # o.quantity.toText() # ","
          # o.totalPrice.toText() # ","
          # o.status # ","
          # "\"" # o.notes # "\"" # ","
          # o.createdAt.toText() # "\n";
    };
    csv
  };

  // ── Admin updates ──────────────────────────────────────────────────────────

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : Text) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { #err("Order not found") };
      case (?o)   {
        orders.add(orderId, {
          id = o.id; productId = o.productId; productName = o.productName;
          customerName = o.customerName; email = o.email; phone = o.phone;
          quantity = o.quantity; totalPrice = o.totalPrice;
          notes = o.notes; createdAt = o.createdAt;
          status = newStatus;
        });
        #ok
      };
    }
  };

  public shared ({ caller }) func addProduct(
    name : Text, description : Text, price : Float, unit : Text, stock : Nat
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = nextProductId;
    nextProductId += 1;
    products.add(id, { id; name; description; price; unit; stock; isActive = true });
    id
  };

  public shared ({ caller }) func updateProduct(
    id : Nat, name : Text, description : Text, price : Float, unit : Text, stock : Nat, isActive : Bool
  ) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { #err("Product not found") };
      case (?_)   {
        products.add(id, { id; name; description; price; unit; stock; isActive });
        #ok
      };
    }
  };

  public shared ({ caller }) func deactivateProduct(id : Nat) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can deactivate products");
    };
    switch (products.get(id)) {
      case (null) { #err("Product not found") };
      case (?p)   {
        products.add(id, {
          id = p.id; name = p.name; description = p.description;
          price = p.price; unit = p.unit; stock = p.stock; isActive = false;
        });
        #ok
      };
    }
  };

};
