// Additional design patterns: Builder, Observer (enhanced), and Strategy

// Builder Pattern
class Car {
  constructor() {
    this.parts = {};
  }

  addPart(part, value) {
    this.parts[part] = value;
  }

  toString() {
    return `Car with: ${JSON.stringify(this.parts)}`;
  }
}

class CarBuilder {
  constructor() {
    this.car = new Car();
  }

  buildEngine(type) {
    this.car.addPart('engine', type);
    return this;
  }

  buildWheels(count) {
    this.car.addPart('wheels', count);
    return this;
  }

  buildColor(color) {
    this.car.addPart('color', color);
    return this;
  }

  buildGPS(hasGPS) {
    this.car.addPart('GPS', hasGPS);
    return this;
  }

  build() {
    const result = this.car;
    this.car = new Car(); // Reset for next build
    return result;
  }
}

// Enhanced Observer Pattern
class Observable {
  constructor() {
    this.observers = new Map();
  }

  subscribe(event, callback) {
    if (!this.observers.has(event)) {
      this.observers.set(event, []);
    }
    this.observers.get(event).push(callback);
  }

  unsubscribe(event, callback) {
    if (this.observers.has(event)) {
      const index = this.observers.get(event).indexOf(callback);
      if (index > -1) {
        this.observers.get(event).splice(index, 1);
      }
    }
  }

  notify(event, data) {
    if (this.observers.has(event)) {
      this.observers.get(event).forEach(callback => callback(data));
    }
  }
}

// Strategy Pattern
class PaymentStrategy {
  pay(amount) {
    throw new Error('Pay method must be implemented');
  }
}

class CreditCardStrategy extends PaymentStrategy {
  constructor(cardNumber, cvv) {
    super();
    this.cardNumber = cardNumber;
    this.cvv = cvv;
  }

  pay(amount) {
    console.log(`Paid $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`);
  }
}

class PayPalStrategy extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
  }

  pay(amount) {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
  }
}

class BitcoinStrategy extends PaymentStrategy {
  constructor(walletAddress) {
    super();
    this.walletAddress = walletAddress;
  }

  pay(amount) {
    console.log(`Paid $${amount} using Bitcoin to wallet ${this.walletAddress.slice(0, 10)}...`);
  }
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null;
  }

  addItem(item) {
    this.items.push(item);
  }

  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy;
  }

  calculateTotal() {
    return this.items.reduce((total, item) => total + item.price, 0);
  }

  checkout() {
    if (!this.paymentStrategy) {
      throw new Error('Payment strategy not set');
    }
    const total = this.calculateTotal();
    this.paymentStrategy.pay(total);
  }
}

export { 
  Car, 
  CarBuilder, 
  Observable, 
  PaymentStrategy, 
  CreditCardStrategy, 
  PayPalStrategy, 
  BitcoinStrategy, 
  ShoppingCart 
};