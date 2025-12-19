import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

// Use runtime configuration from config.js (generated from env vars)
// Fallback to defaults if config.js is not loaded
const options = window.RUM_CONFIG || {
    clientToken: 'rumZmfACViIKP6YzziM',
    applicationId: 'web-application-id',
    site: 'o2-openobserve.p.zacharie.org',
    service: 'my-web-application',
    env: 'production',
    version: '0.0.1',
    organizationIdentifier: 'default',
    insecureHTTP: false,
    apiVersion: 'v1',
};

// Initialize OpenObserve RUM
openobserveRum.init({
    applicationId: options.applicationId,
    clientToken: options.clientToken,
    site: options.site,
    organizationIdentifier: options.organizationIdentifier,
    service: options.service,
    env: options.env,
    version: options.version,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    apiVersion: options.apiVersion,
    insecureHTTP: options.insecureHTTP,
    defaultPrivacyLevel: 'allow'
});

// Initialize OpenObserve Logs
openobserveLogs.init({
    clientToken: options.clientToken,
    site: options.site,
    organizationIdentifier: options.organizationIdentifier,
    service: options.service,
    env: options.env,
    version: options.version,
    forwardErrorsToLogs: true,
    insecureHTTP: options.insecureHTTP,
    apiVersion: options.apiVersion,
});

// Set user context
openobserveRum.setUser({
    id: "1",
    name: "Captain Hook",
    email: "captainhook@example.com",
});

// Start session replay recording
openobserveRum.startSessionReplayRecording();

// Update status
const statusText = document.getElementById('status-text');
statusText.textContent = 'Connected';

// Stats counters
let pageViews = 1;
let interactions = 0;
let errors = 0;

// Update stats display
function updateStats() {
    document.getElementById('page-views').textContent = pageViews;
    document.getElementById('interactions').textContent = interactions;
    document.getElementById('errors').textContent = errors;
}

// Initialize stats
updateStats();

// Log initial page view
openobserveLogs.logger.info('Application initialized', {
    timestamp: new Date().toISOString(),
    user: 'Captain Hook'
});

// Button event handlers
document.getElementById('btn-action').addEventListener('click', () => {
    interactions++;
    updateStats();

    openobserveRum.addAction('user_action', {
        action_type: 'button_click',
        button_name: 'Track Action',
        timestamp: new Date().toISOString()
    });

    openobserveLogs.logger.info('User action tracked', {
        action: 'Track Action',
        interactions: interactions
    });

    showNotification('✅ Action tracked successfully!', 'success');
});

document.getElementById('btn-navigate').addEventListener('click', () => {
    interactions++;
    updateStats();

    // Simulate navigation
    const fakeUrl = `/page/${Math.floor(Math.random() * 100)}`;

    openobserveRum.addAction('navigation', {
        action_type: 'navigation',
        url: fakeUrl,
        timestamp: new Date().toISOString()
    });

    openobserveLogs.logger.info('Navigation simulated', {
        url: fakeUrl,
        interactions: interactions
    });

    pageViews++;
    updateStats();

    showNotification(`🧭 Navigated to ${fakeUrl}`, 'info');
});

document.getElementById('btn-resource').addEventListener('click', async () => {
    interactions++;
    updateStats();

    // Simulate resource loading
    const startTime = performance.now();

    try {
        // Fake API call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        const duration = performance.now() - startTime;

        openobserveRum.addAction('resource_load', {
            action_type: 'resource',
            resource_type: 'api_call',
            duration: duration,
            timestamp: new Date().toISOString()
        });

        openobserveLogs.logger.info('Resource loaded', {
            type: 'API call',
            duration: `${duration.toFixed(2)}ms`,
            interactions: interactions
        });

        showNotification(`⚡ Resource loaded in ${duration.toFixed(0)}ms`, 'success');
    } catch (error) {
        openobserveLogs.logger.error('Resource loading failed', { error: error.message });
        showNotification('❌ Resource loading failed', 'error');
    }
});

document.getElementById('btn-error').addEventListener('click', () => {
    interactions++;
    errors++;
    updateStats();

    // Generate a test error
    const testError = new Error('This is a test error for demonstration');

    openobserveLogs.logger.error('Test error generated', {
        error_message: testError.message,
        error_stack: testError.stack,
        timestamp: new Date().toISOString()
    });

    openobserveRum.addAction('error_generated', {
        action_type: 'error',
        error_type: 'test_error',
        timestamp: new Date().toISOString()
    });

    showNotification('⚠️ Test error logged to OpenObserve', 'warning');
});

document.getElementById('btn-log').addEventListener('click', () => {
    interactions++;
    updateStats();

    const logLevels = ['debug', 'info', 'warn', 'error'];
    const randomLevel = logLevels[Math.floor(Math.random() * logLevels.length)];

    openobserveLogs.logger[randomLevel](`Test ${randomLevel} log message`, {
        level: randomLevel,
        random_value: Math.random(),
        timestamp: new Date().toISOString(),
        interactions: interactions
    });

    openobserveRum.addAction('log_sent', {
        action_type: 'log',
        log_level: randomLevel,
        timestamp: new Date().toISOString()
    });

    showNotification(`📝 ${randomLevel.toUpperCase()} log sent`, 'info');
});

document.getElementById('btn-user').addEventListener('click', () => {
    interactions++;
    updateStats();

    const users = [
        { id: "1", name: "Captain Hook", email: "captainhook@example.com" },
        { id: "2", name: "Peter Pan", email: "peterpan@example.com" },
        { id: "3", name: "Tinker Bell", email: "tinkerbell@example.com" },
        { id: "4", name: "Wendy Darling", email: "wendy@example.com" }
    ];

    const randomUser = users[Math.floor(Math.random() * users.length)];

    openobserveRum.setUser(randomUser);

    openobserveLogs.logger.info('User context updated', {
        user_id: randomUser.id,
        user_name: randomUser.name,
        timestamp: new Date().toISOString()
    });

    openobserveRum.addAction('user_updated', {
        action_type: 'user_update',
        user_name: randomUser.name,
        timestamp: new Date().toISOString()
    });

    showNotification(`👤 User updated to ${randomUser.name}`, 'success');
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        background: type === 'success' ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' :
            type === 'error' ? 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' :
                type === 'warning' ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' :
                    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '400px'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Track long tasks
if ('PerformanceObserver' in window) {
    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                openobserveLogs.logger.warn('Long task detected', {
                    duration: entry.duration,
                    startTime: entry.startTime,
                    timestamp: new Date().toISOString()
                });
            }
        });
        observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
        console.log('Long task monitoring not supported');
    }
}

console.log('🚀 OpenObserve RUM Demo initialized successfully!');
