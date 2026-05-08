package com.data4n6.tenant;

/**
 * Stores the current tenant identifier for the active thread.
 * Uses ThreadLocal to ensure isolation between concurrent requests.
 */
public class TenantContext {

    public static final String DEFAULT_TENANT = "tenant_default";

    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    private TenantContext() {}

    public static void setCurrentTenant(String tenant) {
        currentTenant.set(tenant);
    }

    public static String getCurrentTenant() {
        String tenant = currentTenant.get();
        return (tenant != null && !tenant.isBlank()) ? tenant : DEFAULT_TENANT;
    }

    public static void clear() {
        currentTenant.remove();
    }
}
