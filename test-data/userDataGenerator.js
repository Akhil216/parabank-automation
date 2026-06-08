'use strict';

// Generates a fresh user object each time it's called.
// Username needs to be unique per run otherwise ParaBank throws a duplicate error,
// so we bake in a timestamp. Everything else is just plausible-looking static data.

function newUser() {
  const suffix = Date.now();
  // SSN must be unique per run — the shared ParaBank demo server enforces SSN
  // uniqueness, and using a hardcoded SSN causes a "username already exists"
  // error once that SSN is in the database.
  const rand = Math.floor(Math.random() * 900000000) + 100000000;
  const ssn = `${String(rand).slice(0, 3)}-${String(rand).slice(3, 5)}-${String(rand).slice(5)}`;

  return {
    firstName : 'Jane',
    lastName  : 'Tester',
    street    : '45 Elm Street',
    city      : 'Austin',
    state     : 'TX',
    zip       : '78701',
    phone     : '5125550199',
    ssn,
    username  : `jane_${suffix}`,
    password  : 'Test@1234',
  };
}

module.exports = { newUser };
