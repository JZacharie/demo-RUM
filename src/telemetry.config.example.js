// OpenTelemetry Configuration Example
// This file shows how to configure OpenTelemetry for different environments

export const telemetryConfigs = {
    // Development configuration
    development: {
        serviceName: 'demo-rum-dev',
        serviceVersion: '0.0.4',
        environment: 'development',
        endpoint: 'http://localhost:5080/api/default/v1/traces',
        headers: {
            'Authorization': 'Basic ' + btoa('dev-token:'),
            'stream-name': 'default'
        },
        // More verbose logging in dev
        debug: true,
        // Smaller batch size for faster feedback
        batchConfig: {
            maxQueueSize: 50,
            maxExportBatchSize: 5,
            scheduledDelayMillis: 1000,
        }
    },

    // Staging configuration
    staging: {
        serviceName: 'demo-rum-staging',
        serviceVersion: '0.0.4',
        environment: 'staging',
        endpoint: 'https://o2-openobserve-staging.p.zacharie.org/api/default/v1/traces',
        headers: {
            'Authorization': 'Basic ' + btoa('staging-token:'),
            'stream-name': 'default'
        },
        debug: false,
        batchConfig: {
            maxQueueSize: 100,
            maxExportBatchSize: 10,
            scheduledDelayMillis: 500,
        }
    },

    // Production configuration
    production: {
        serviceName: 'demo-rum',
        serviceVersion: '0.0.4',
        environment: 'production',
        endpoint: 'https://o2-openobserve.p.zacharie.org/api/default/v1/traces',
        headers: {
            'Authorization': 'Basic ' + btoa('rumZmfACViIKP6YzziM:'),
            'stream-name': 'default'
        },
        debug: false,
        batchConfig: {
            maxQueueSize: 100,
            maxExportBatchSize: 10,
            scheduledDelayMillis: 500,
        }
    }
};

// Helper function to get config based on environment
export function getTelemetryConfig() {
    const env = import.meta.env.MODE || 'development';
    return telemetryConfigs[env] || telemetryConfigs.development;
}

// Example usage:
// import { getTelemetryConfig } from './telemetry.config.js';
// const config = getTelemetryConfig();
// initTelemetry(config);
