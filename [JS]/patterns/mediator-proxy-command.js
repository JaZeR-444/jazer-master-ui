// Additional design patterns: Mediator, Proxy, and Command

// Mediator Pattern
class ChatRoomMediator {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  sendMessage(message, sender) {
    this.users.forEach(user => {
      if (user !== sender) {
        user.receive(message, sender);
      }
    });
  }
}

class User {
  constructor(name, chatroom) {
    this.name = name;
    this.chatroom = chatroom;
    chatroom.addUser(this);
  }

  send(message) {
    console.log(`${this.name} sends: ${message}`);
    this.chatroom.sendMessage(message, this);
  }

  receive(message, sender) {
    console.log(`${this.name} received message from ${sender.name}: ${message}`);
  }
}

// Proxy Pattern
class RealImage {
  constructor(filename) {
    this.filename = filename;
    this.loadImageFromDisk();
  }

  loadImageFromDisk() {
    console.log(`Loading image: ${this.filename}`);
  }

  display() {
    console.log(`Displaying image: ${this.filename}`);
  }
}

class ProxyImage {
  constructor(filename) {
    this.filename = filename;
    this.realImage = null;
  }

  display() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// Command Pattern
class Command {
  execute() {
    throw new Error('Execute method must be implemented');
  }

  undo() {
    throw new Error('Undo method must be implemented');
  }
}

class Light {
  constructor() {
    this.isOn = false;
  }

  turnOn() {
    this.isOn = true;
    console.log('Light is ON');
  }

  turnOff() {
    this.isOn = false;
    console.log('Light is OFF');
  }
}

class SwitchOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }

  execute() {
    this.light.turnOn();
  }

  undo() {
    this.light.turnOff();
  }
}

class SwitchOffCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }

  execute() {
    this.light.turnOff();
  }

  undo() {
    this.light.turnOn();
  }
}

class Switch {
  constructor() {
    this.history = [];
  }

  storeAndExecute(command) {
    command.execute();
    this.history.push(command);
  }

  undoLast() {
    if (this.history.length > 0) {
      const lastCommand = this.history.pop();
      lastCommand.undo();
    }
  }
}

export { ChatRoomMediator, User, RealImage, ProxyImage, Command, Light, SwitchOnCommand, SwitchOffCommand, Switch };