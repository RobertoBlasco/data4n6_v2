package com.data4n6.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Reads the X-Tenant-ID header from each HTTP request and stores it in TenantContext.
 * Clears the context after the request completes to avoid thread reuse issues.
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {

    public static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String tenant = request.getHeader(TENANT_HEADER);
        TenantContext.setCurrentTenant(tenant);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        TenantContext.clear();
    }
}
