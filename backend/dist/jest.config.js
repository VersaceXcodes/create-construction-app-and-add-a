module.exports = {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": [
        "<rootDir>"
    ],
    "testMatch": [
        "**/__tests__/**/*.ts",
        "**/?(*.)+(spec|test).ts"
    ],
    "extensionsToTreatAsEsm": [".ts"],
    "transform": {
        "^.+\\.ts$": ["ts-jest", {
                "useESM": true
            }]
    },
    "moduleNameMapper": {
        "^(\\.{1,2}/.*)\\.js$": "$1"
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
    "coverageThreshold": {
        "global": {
            "branches": 70,
            "functions": 75,
            "lines": 80,
            "statements": 80
        }
    },
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