export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "assignment.js", "!**/node_modules/**"],
  coverageDirectory: "coverage",
  verbose: true,
};
