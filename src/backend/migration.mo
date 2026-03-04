import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Nat64 "mo:core/Nat64";

module {
  type OldProduct = {
    id          : Nat;
    name        : Text;
    description : Text;
    price       : Float;
    unit        : Text;
    stock       : Nat;
    isActive    : Bool;
  };

  type OldOrder = {
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

  type OldActor = {
    nextProductId : Nat;
    nextOrderId   : Nat;
    products      : Map.Map<Nat, OldProduct>;
    orders        : Map.Map<Nat, OldOrder>;
  };

  type NewProduct = OldProduct;
  type NewOrder   = OldOrder;

  type ContactSubmission = {
    id        : Nat;
    name      : Text;
    email     : Text;
    phone     : Text;
    message   : Text;
    createdAt : Nat64;
  };

  type NewActor = {
    nextProductId     : Nat;
    nextOrderId       : Nat;
    nextContactId     : Nat;
    products          : Map.Map<Nat, NewProduct>;
    orders            : Map.Map<Nat, NewOrder>;
    contactSubmissions: Map.Map<Nat, ContactSubmission>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextContactId      = 1;
      contactSubmissions = Map.empty<Nat, ContactSubmission>();
    };
  };
};
