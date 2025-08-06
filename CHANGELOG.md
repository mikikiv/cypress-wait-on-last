# Changelog

## [1.1.1] - [2025-08-06]

### Internal

- Refactor command function implementation to use proper TypeScript function declarations
- Remove redundant helper function to reduce code duplication
- Remove Cypress tests from being included in the dist folder

## [1.1.0] - [2025-07-17]

### Enhancements

- Support for chai assertions within the validation function
- Validation function can now have empty params

### Misc

- Consolidate type definitions
- Update to Cypress 14.5.2
- Adds ci/cd configurations

## [1.0.0] - [2025-06-19]

### Features

- Initial release
- `waitOnLast` command with validation support
- TypeScript support
- Flexible parameter options (validation function or options object)
- Custom error messages and display messages
- Assumes interception return type with customizable response body types
- Test suite with various scenarios examples
