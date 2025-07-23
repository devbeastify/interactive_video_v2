
*VHL Coding Standards & Best Practices*
**TypeScript & JavaScript Standards**
1. Always Use TypeScript
 - Use TypeScript for all source files.
 - Never use the any type — it's bad practice and makes future migrations harder.
 - Always use proper type definitions instead of any.
 - Define typedefs for complex objects and arrays.
 - Use the @ts-check pragma in files: // @ts-check, but only if the file is complex enough to require TypeScript. If the file is simple enough that TypeScript isn’t needed, don’t force it.
 Example: Type Definitions
    // ✅ Good - Specific types
    @param { 'article' | 'capitalization' | 'punctuation' | 'spelling' } type
    // ✅ Good - Proper typedef
    /**
    * @typedef {Object} DistanceEdit
    * @property {string} type
    * @property {string} value
    */
    // ❌ Bad - Using any
    @param {any} item
**Code Style & Formatting**
1. Line Length
 - Maximum 80 characters per line.
 - Never exceed 100 characters.
 - Break long lines appropriately for readability.
2. Naming Conventions
 - Use snake_case for filenames (store and JS files), and camelCase for Vue components.
 - Always choose descriptive and meaningful names.
 - Consistently follow company conventions.
3. Quotes & Semicolons
 - Use single quotes for strings (ESLint will catch double quotes).
 - Always use semicolons in JavaScript.
 - Do not rely on Automatic Semicolon Insertion (ASI).
4. Spacing & Formatting
 - Example:
    // ✅ Good - Alphabetized and split across lines
    const messages = {
        capitalization: 'Review capitalization.',
        punctuation: 'Review punctuation.',
        spelling: 'Review spelling.'
    };
    // ✅ Good - Proper line breaks
    return (item).cognate_type === 'cognate' || 
        (item).cognate_type === 'false_cognate';

5. Wherever you have a list of properties, alphabetize them.
6.   When used as a verb, setup should be setUp. Update the function names starting with "setup" to "setUp"
7. keys should be alphabetized.
8. normally in the ruby world we would make these types of functions that return a boolean not have a verb in them. Like 'hasPlayButton' or 'playButtonIsVisible'. Non blocking to the PR. But just a suggestion for trying to find a standard way of naming js functions that always return booleans.
9. remove unnecessary console.log


**Documentation Standards**
1. JSDoc Requirements
 - Create JSDoc blocks for all JavaScript functions and classes.
 - Use @return (not @returns).
 - Include parameter types and descriptions in your documentation.
 - Always document complex business logic.
2. Comments Policy
 - Never use inline comments — they often indicate that the code should be refactored for better clarity.
 - Move complex logic to functions with proper documentation instead of commenting on it inline.
 - Use block comments only when absolutely necessary.
 - If you need to explain something, create a function with a doc block to clarify.
   Example:
    // ✅ Good - Function with proper documentation
    /**
     * Validates user input and returns correctness status
     * @param {string} userInput - The user's response
     * @param {string} correctAnswer - The expected answer
     * @return {boolean} Whether the answer is correct
     */
    function validateUserInput(userInput, correctAnswer) {
       // Implementation
    }
    // ❌ Bad - Inline comments
    const result = userInput === correctAnswer; // Check if answer is correct
**Architecture & Design Principles**
1. DRY (Don't Repeat Yourself)
 - Extract duplicate code into reusable functions.
 - Create utility functions for common operations.
 - Avoid code duplication across components — this makes maintenance easier.
2. Single Responsibility Principle
 - Each function should have one clear purpose.
 - Break large functions into smaller, more focused ones.
 - Extract business logic from components and move it into composables or modules.
3. Avoiding Deep Nesting
 - Break out deeply nested code into separate functions.
 - Deep nesting is a code smell and makes debugging harder.
 - Refactor complex conditions into clear, readable functions.
4. Function Design
    // ✅ Good - Small, focused functions
    function createMissingToken(config) {
    const defaults = { tokenType: "word", editType: "missing" };
    return { ...defaults, ...config };
    }
    // ✅ Good - Extracted business logic
    function validateResponse(response) {
    return showCorrectnessToUser(response);
    }
**Vue.js Best Practices**
1. Component Structure
 - Suffix root components with "App" and use camelCase (e.g., QuickCheckApp).
 - Keep components focused and lightweight.
 - Extract business logic into composables or modules to maintain component clarity.
 - Allow child components to define their own styling based on props, keeping them adaptable.
 - Avoid breaking component API boundaries—maintain clear and predictable interfaces between components.
2. Store Management
 - Read and write directly to store properties whenever possible.
 - Use store.$patch for multiple property changes at once.
 - Avoid unnecessary actions on the main store.
 - Keep actions for handling complex operations only.
    // ✅ Good - Direct store access
    store.activityInfo = activity;
    // ✅ Good - Multiple changes at once
    store.$patch({
        currentStep: newStep,
        isComplete: true
    });
 - Use props or state to control child component behavior for flexibility and reusability
3. Styling
 - Use CSS modules instead of scoped styles when possible.
   Class names should be written in kebab-case, not camelCase.
   Use $style to apply the class to HTML elements.
    example: 
    .quick-check {
       /* Styling here */
    }
    :class="$style['quick-check']"
 - Avoid :deep selectors – they break component API boundaries.
 - Use props or state to control child component styling.
 - Consider using the rpx() Sass method for responsive design.
    Use base.rpx() from @use 'MusicV3/v3/styles/base' to set sizes in styles.
    example:
    @use 'MusicV3/v3/styles/base' as base;  
    margin-bottom: base.rpx(16);
4. Component Communication
 - Use props and events for parent-child communication.
 - Avoid deep component coupling.
 - Keep component boundaries clear to improve maintainability and readability.
 
**Performance & Optimization**
1. Code Organization
 - Move heavy methods to separate modules as your files grow.
 - Import methods instead of keeping everything in one file for better structure.
 - Always consider file size and complexity as the project scales.
2. Bundle Optimization
 - Leverage Vite's module system when possible for faster builds and better performance.
 - Use CSS modules for improved style isolation and to avoid global style leaks.
 - Optimize imports and dependencies to keep the bundle size small and performance high.


 
*This document should be updated regularly as new patterns and standards emerge. Always refer to the latest version when working on VHL projects.*