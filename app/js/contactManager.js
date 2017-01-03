var ContactManager = function (engine) {
  this.engine = engine;
  this.contacts = [];

  this.getContactIndex = function (contact) {
    for (var i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i][0] === contact[0] && this.contacts[i][1] === contact[1])
        return i;
    }
    return -1;
  };

  this.getEntityContacts = function (entity) {
    var ret = [];

    for (var i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i][0] === entity)
        ret.push(this.contacts[i][1]);

      if (this.contacts[i][1] === entity)
        ret.push(this.contacts[i][0]);
    }

    return ret;
  };

  this.anyContact = function (a, b) {
    for (var i = 0; i < this.contacts.length; i++) {
      if (a.indexOf(this.contacts[i][0]) >= 0 && b.indexOf(this.contacts[i][1]) >= 0 ||
        a.indexOf(this.contacts[i][1]) >= 0 && b.indexOf(this.contacts[i][0]) >= 0)
        return true;
    }

    return false;
  };

  this.makeContact = function (contact) {
    return [
      this.engine.entityManager.getEntityByFixture(contact.GetFixtureA()),
      this.engine.entityManager.getEntityByFixture(contact.GetFixtureB())
    ];
  };

  this.BeginContact = function (contactPtr) {
    this.contacts.push(this.makeContact(wrapPointer(contactPtr, b2Contact)));
  };

  this.EndContact = function (contactPtr) {
    var contact = this.makeContact(wrapPointer(contactPtr, b2Contact));

    this.contacts.splice(this.getContactIndex(contact), 1);
  };

  this.PreSolve = function () {
  };
  this.PostSolve = function () {
  };

  JSContactListener.call(this);
};


module.exports = ContactManager;