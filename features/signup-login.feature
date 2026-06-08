Feature: ParaBank account registration and login
  New users should be able to register on the site and immediately
  sign back in using those credentials. After login, the account
  balance must be visible and printed out.

  Background:
    Given the ParaBank home page is open

  # ─── Registration: happy path ────────────────────────────────────────────

  @smoke @registration
  Scenario: Register a new account with all fields filled in correctly
    When I click the Register link
    And I complete the registration form with valid details
    And I submit the form
    Then the registration should succeed
    And the success page should greet me by name

  # ─── Registration: field-level edge cases ────────────────────────────────

  @negative @registration
  Scenario: Submitting a completely empty registration form shows errors on all required fields
    When I click the Register link
    And I submit the form without entering anything
    Then I should see field-level validation errors

  @negative @registration
  Scenario: Submitting the form with only the first name filled in still fails
    When I click the Register link
    And I fill in only the first name and submit
    Then I should see field-level validation errors

  @negative @registration
  Scenario: Whitespace-only values in required fields are treated as empty
    When I click the Register link
    And I fill the registration form with whitespace in every field
    And I submit the form
    Then I should see field-level validation errors

  @negative @registration
  Scenario: Mismatched password and confirm-password blocks registration
    When I click the Register link
    And I fill the form with valid details but mismatched passwords
    And I submit the form
    Then I should see a password mismatch error

  @negative @registration
  Scenario: Registering with an already-taken username is rejected
    Given I have already registered an account
    When I click the Register link
    And I fill the form with the same username that was just registered
    And I submit the form
    Then I should see a username-already-exists error

  # ─── Login: happy path ───────────────────────────────────────────────────

  @smoke @login
  Scenario: Sign in with an existing account and see the balance
    Given I have already registered an account
    When I log in with those credentials
    Then I should land on the accounts overview
    And the account balance should be visible on screen
    And the balance figure should be printed to the console

  # ─── Login: credential edge cases ────────────────────────────────────────

  @negative @login
  Scenario: Login with a username that does not exist
    When I try to log in with a username that was never registered
    Then the page should show a login error

  @negative @login
  Scenario: Correct username but wrong password is rejected
    Given I have already registered an account
    When I try to log in with the correct username but the wrong password
    Then the page should show a login error

  @negative @login
  Scenario: Empty username field alone causes a login error
    When I submit the login form with only a password and no username
    Then the page should show a login error

  @negative @login
  Scenario: Empty password field alone causes a login error
    When I submit the login form with only a username and no password
    Then the page should show a login error

  @negative @login
  Scenario: Both login fields left blank causes a login error
    When I submit the login form with both fields empty
    Then the page should show a login error

  @negative @login
  Scenario: Username is case-sensitive at login
    Given I have already registered an account
    When I try to log in with the username in the wrong case
    Then the page should show a login error

  # ─── Full round-trip ─────────────────────────────────────────────────────

  @end-to-end
  Scenario: Register, log out, then log back in and verify balance
    When I click the Register link
    And I complete the registration form with valid details
    And I submit the form
    Then the registration should succeed
    When I log out
    And I log in with those credentials
    Then I should land on the accounts overview
    And the account balance should be visible on screen
    And the balance figure should be printed to the console
