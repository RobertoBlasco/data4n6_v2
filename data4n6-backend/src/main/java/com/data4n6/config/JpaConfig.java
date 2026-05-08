package com.data4n6.config;

import com.data4n6.tenant.SchemaMultiTenantConnectionProvider;
import com.data4n6.tenant.TenantIdentifierResolver;
import org.hibernate.cfg.AvailableSettings;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaConfig {

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(
            SchemaMultiTenantConnectionProvider connectionProvider,
            TenantIdentifierResolver tenantIdentifierResolver) {
        return properties -> {
            properties.put(AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER, connectionProvider);
            properties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, tenantIdentifierResolver);
        };
    }

    @Bean
    public AuditorAware<String> auditorProvider() {
        // TODO: replace with authenticated user when security module is implemented
        return () -> Optional.of("system");
    }
}
