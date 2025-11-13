module.exports = {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": [
        "<rootDir>/tests"
    ],
    "testMatch": [
        "**/__tests__/**/*.ts",
        "**/?(*.)+(spec|test).ts"
    ],
    "transform": {
        "^.+\\.ts$": "ts-jest"
    },
    "collectCoverageFrom": [
        "server.ts",
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/**/*.interface.ts"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": [
        "text",
        "lcov",
        "html"
    ],
    "coverageThresholds": {
        "global": {
            "branches": 70,
            "functions": 75,
            "lines": 80,
            "statements": 80
        }
    },
    "setupFilesAfterEnv": [
        "<rootDir>/tests/setup/testSetup.ts"
    ],
    "testTimeout": 30000,
    "maxWorkers": 1,
    "verbose": true,
    "detectOpenHandles": true,
    "forceExit": true,
    "clearMocks": true,
    "resetMocks": true,
    "restoreMocks": true
};
export {};
//# sourceMappingURL=jest.config.js.map