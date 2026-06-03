# DATA4N6 — Exportación completa del proyecto Spring Boot + Angular

Generado: 2026-05-18  
Stack: Spring Boot 3.4.5 · Java 21 · PostgreSQL 16 · Angular 21 · PrimeNG 21

---

## ÍNDICE

1. [Requisitos e instalación en nueva máquina](#1-requisitos-e-instalación)
2. [Estructura del proyecto](#2-estructura)
3. [Spring Boot — `api/`](#3-spring-boot)
   - pom.xml
   - application.properties
   - Application.java
   - Excepciones
   - Seguridad (JWT)
   - Entidades
   - Repositorios
   - Servicios
   - Controladores
4. [Angular — `app/`](#4-angular)
   - package.json
   - Configuración
   - Modelos
   - Servicios
   - Páginas
5. [Estado actual y próximos pasos](#5-estado-actual)

---

## 1. Requisitos e instalación

### En la nueva máquina necesitas

| Herramienta | Versión mínima | Instalación |
|---|---|---|
| Java JDK | 21 | `sudo apt install openjdk-21-jdk` |
| Maven | 3.9+ | `sudo apt install maven` |
| Node.js | 22 | `nvm install 22` |
| Angular CLI | 21 | `npm install -g @angular/cli` |
| Docker | cualquiera | para levantar PostgreSQL |

### Arrancar el proyecto

```bash
# 1. PostgreSQL
docker compose up -d postgres

# 2. API Spring Boot (desde /api)
./mvnw spring-boot:run
# o: mvn spring-boot:run
# Escucha en http://localhost:8080

# 3. Frontend Angular (desde /app)
npm install
ng serve
# Escucha en http://localhost:4200
```

### Credenciales
- **Login API:** `admin` / `admin`
- **PostgreSQL:** `postgres` / `Ninguna*01`
- **Base de datos:** `data4n6`, schema `inventario` (y `datgen` para t100_unidades)

---

## 2. Estructura

```
data4n6/
├── api/                         ← Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/data4n6/api/
│       ├── Application.java
│       ├── controller/          ← @RestController
│       ├── dto/                 ← Records (Request / Response)
│       ├── entity/              ← @Entity (tablas JPA)
│       ├── exception/           ← Excepciones + GlobalExceptionHandler
│       ├── repository/          ← JpaRepository
│       ├── security/            ← JWT + Spring Security
│       └── service/             ← Lógica de negocio
├── app/                         ← Angular
│   └── src/app/
│       ├── core/services/       ← ApiService
│       ├── models/              ← Interfaces TypeScript
│       └── pages/               ← Componentes de página
└── docker-compose.yml
```

---

## 3. Spring Boot

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.5</version>
        <relativePath/>
    </parent>
    <groupId>com.data4n6</groupId>
    <artifactId>api</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>data4n6-api</name>
    <description>Sistema de gestión de inventario forense - API REST</description>
    <properties>
        <java.version>21</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.6</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.6</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.6</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

### application.properties

```properties
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/data4n6
spring.datasource.username=postgres
spring.datasource.password=Ninguna*01
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

jwt.secret=data4n6-secret-key-for-jwt-signing-minimum-256-bits-long
jwt.expiration=86400000
```

---

### Application.java

```java
package com.data4n6.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## Excepciones

### ResourceNotFoundException.java

```java
package com.data4n6.api.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String entidad, UUID id) {
        super(entidad + " no encontrado: " + id);
    }

    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }
}
```

### ConflictException.java

```java
package com.data4n6.api.exception;

public class ConflictException extends RuntimeException {
    public ConflictException(String mensaje) {
        super(mensaje);
    }
}
```

### BadRequestException.java

```java
package com.data4n6.api.exception;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String mensaje) {
        super(mensaje);
    }
}
```

### GlobalExceptionHandler.java

```java
package com.data4n6.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<String> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<String> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}
```

---

## Seguridad (JWT)

### JwtService.java

```java
package com.data4n6.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Date;
import javax.crypto.SecretKey;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiration = expiration;
    }

    public String generarToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey)
                .compact();
    }

    public String extraerUsername(String token) {
        return extraerClaims(token).getSubject();
    }

    public boolean esValido(String token, String username) {
        String usernameToken = extraerUsername(token);
        return usernameToken.equals(username) && !haExpirado(token);
    }

    private boolean haExpirado(String token) {
        return extraerClaims(token).getExpiration().before(new Date());
    }

    private Claims extraerClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

### JwtAuthFilter.java

```java
package com.data4n6.api.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username = jwtService.extraerUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtService.esValido(token, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

### SecurityConfig.java

```java
package com.data4n6.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        // IMPORTANTE: NO setAllowCredentials(true) — bloquea DELETE con CORS
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### UserDetailsServiceImpl.java

> PENDIENTE: Actualmente hardcodeado. Pendiente conectar a tabla de usuarios en BD.

```java
package com.data4n6.api.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username.equals("admin")) {
            return User.withUsername("admin")
                    .password(new BCryptPasswordEncoder().encode("admin"))
                    .roles("ADMIN")
                    .build();
        }
        throw new UsernameNotFoundException("Usuario no encontrado: " + username);
    }
}
```

---

## Entidades

> Convención: FK → nombre del campo Java = nombre de la clase en camelCase (ej: `t200Marcas`).  
> PK: UUID asignado manualmente con `UUID.randomUUID()` antes de guardar.  
> Schema `inventario` para la mayoría; `datgen` para t100_unidades.

### T200Marcas.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t200_marcas")
public class T200Marcas {
    @Id @Column(name = "t200_marcas_id")
    private UUID id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;
}
```

### T200Modelos.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t200_modelos")
public class T200Modelos {
    @Id @Column(name = "t200_modelos_id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "t200_marcas_id", nullable = false)
    private T200Marcas t200Marcas;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;
}
```

### T200Materiales.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t200_materiales")
public class T200Materiales {
    @Id @Column(name = "t200_materiales_id")
    private UUID id;

    @Column(name = "codigo_ref")
    private String codRef;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;
}
```

### T200Estados.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t200_estados")
public class T200Estados {
    @Id @Column(name = "t200_estados_id")
    public UUID id;

    @Column(name = "codigo_ref")
    public String codRef;

    @Column(name = "nombre")
    public String nombre;

    @Column(name = "descripcion")
    public String descripcion;
}
```

### T200EntradasAlmacen.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t200_entradas_almacen")
public class T200EntradasAlmacen {
    @Id @Column(name = "t200_entradas_almacen_id")
    public UUID id;

    @Column(name = "codigo_ref")
    public String codRef;

    @Column(name = "nombre")
    public String nombre;

    @Column(name = "descripcion")
    public String descripcion;
}
```

### T200Docs.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t200_docs")
public class T200Docs {
    @Id @Column(name = "t200_docs_id")
    private UUID id;

    @Column
    private String nombre;

    @Column
    private String descripcion;
}
```

### T100Materiales.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t100_materiales")
public class T100Materiales {
    @Id @Column(name = "t100_materiales_id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "t200_materiales_id", nullable = false)
    private T200Materiales t200Materiales;

    @ManyToOne
    @JoinColumn(name = "t200_marcas_id", nullable = false)
    private T200Marcas t200Marcas;

    @Column(name = "modelo")
    private String modelo;
}
```

### T100Almacenes.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t100_almacenes")
public class T100Almacenes {
    @Id @Column(name = "t100_almacenes_id")
    private UUID id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "es_recepcion", nullable = false)
    private boolean es_recepcion;
}
```

### T100Unidades.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "datgen", name = "t100_unidades")
public class T100Unidades {
    @Id @Column(name = "t100_unidades_id")
    private UUID id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;
}
```

### T100Agentes.java

```java
package com.data4n6.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @Entity
@Table(schema = "inventario", name = "t100_agentes")
public class T100Agentes {
    @Id @Column(name = "t100_agentes_id")
    private UUID id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "indicativo")
    private String indicativo;

    @ManyToOne
    @JoinColumn(name = "t100_unidades_id", nullable = false)
    private T100Unidades t100Unidades;
}
```

---

## Repositorios

> Los repositorios sin JOIN FETCH heredan `findAll()`, `findById()`, `save()`, `deleteById()`, `existsById()` de `JpaRepository`.  
> Se añade `@Query` con JOIN FETCH cuando hay relaciones `@ManyToOne` para evitar N+1.

```java
// T200MarcasRepository
public interface T200MarcasRepository extends JpaRepository<T200Marcas, UUID> {}

// T200ModelosRepository — JOIN FETCH + existsBy para FK check en delete
public interface T200ModelosRepository extends JpaRepository<T200Modelos, UUID> {
    @Query("SELECT m from T200Modelos m JOIN FETCH m.t200Marcas")
    List<T200Modelos> findAllWithT200Marcas();

    boolean existsByT200Marcas_Id(UUID marcaId);
}

// T200MaterialesRepository
public interface T200MaterialesRepository extends JpaRepository<T200Materiales, UUID> {}

// T200EstadosRepository
public interface T200EstadosRepository extends JpaRepository<T200Estados, UUID> {}

// T200EntradasAlmacenRepository
public interface T200EntradasAlmacenRepository extends JpaRepository<T200EntradasAlmacen, UUID> {}

// T200DocsRepository
public interface T200DocsRepository extends JpaRepository<T200Docs, UUID> {}

// T100MaterialesRepository — JOIN FETCH de dos relaciones
public interface T100MaterialesRepository extends JpaRepository<T100Materiales, UUID> {
    @Query("SELECT m FROM T100Materiales m JOIN FETCH m.t200Materiales JOIN FETCH m.t200Marcas")
    List<T100Materiales> findAllWithTodasRelaciones();
}

// T100AlmacenesRepository
public interface T100AlmacenesRepository extends JpaRepository<T100Almacenes, UUID> {}

// T100UnidadesRepository
public interface T100UnidadesRepository extends JpaRepository<T100Unidades, UUID> {}

// T100AgentesRepository — JOIN FETCH unidades
public interface T100AgentesRepository extends JpaRepository<T100Agentes, UUID> {
    @Query("SELECT m from T100Agentes m JOIN FETCH m.t100Unidades")
    List<T100Agentes> findAllWithUnidad();
}
```

---

## Servicios

### BaseService.java (interfaz común)

```java
package com.data4n6.api.service;

import java.util.List;
import java.util.UUID;

public interface BaseService<R, Q> {
    List<R> findAll();
    R findById(UUID id);
    R create(Q request);
    R update(UUID id, Q request);
    void delete(UUID id);
}
```

### T200MarcasService.java

```java
package com.data4n6.api.service;

import com.data4n6.api.entity.T200Marcas;
import com.data4n6.api.exception.ConflictException;
import com.data4n6.api.exception.ResourceNotFoundException;
import com.data4n6.api.repository.T200MarcasRepository;
import com.data4n6.api.repository.T200ModelosRepository;
import com.data4n6.api.dto.T200MarcasResponse;
import com.data4n6.api.dto.T200MarcasRequest;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class T200MarcasService implements BaseService<T200MarcasResponse, T200MarcasRequest> {

    private final T200MarcasRepository t200MarcasRepository;
    private final T200ModelosRepository t200ModelosRepository;

    public T200MarcasService(T200MarcasRepository t200MarcasRepository, T200ModelosRepository t200ModelosRepository) {
        this.t200MarcasRepository = t200MarcasRepository;
        this.t200ModelosRepository = t200ModelosRepository;
    }

    @Override
    public List<T200MarcasResponse> findAll() {
        return t200MarcasRepository.findAll()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public T200MarcasResponse findById(UUID id) {
        return t200MarcasRepository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Marca", id));
    }

    @Override
    public T200MarcasResponse create(T200MarcasRequest request) {
        T200Marcas t200Marca = new T200Marcas();
        t200Marca.setId(UUID.randomUUID());
        t200Marca.setNombre(request.nombre());
        t200Marca.setDescripcion(request.descripcion());
        return toResponse(t200MarcasRepository.save(t200Marca));
    }

    @Override
    public T200MarcasResponse update(UUID id, T200MarcasRequest request) {
        T200Marcas t200Marca = t200MarcasRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca", id));
        t200Marca.setNombre(request.nombre());
        t200Marca.setDescripcion(request.descripcion());
        return toResponse(t200MarcasRepository.save(t200Marca));
    }

    @Override
    public void delete(UUID id) {
        if (!t200MarcasRepository.existsById(id)) {
            throw new ResourceNotFoundException("Marca", id);
        }
        if (t200ModelosRepository.existsByT200Marcas_Id(id)) {
            throw new ConflictException("No se puede eliminar la marca porque tiene modelos asociados");
        }
        t200MarcasRepository.deleteById(id);
    }

    private T200MarcasResponse toResponse(T200Marcas marca) {
        return new T200MarcasResponse(
            marca.getId(),
            marca.getNombre(),
            marca.getDescripcion()
        );
    }
}
```

### T200ModelosService.java

```java
package com.data4n6.api.service;

import com.data4n6.api.dto.T200ModelosResponse;
import com.data4n6.api.dto.T200ModelosRequest;
import com.data4n6.api.entity.T200Modelos;
import com.data4n6.api.exception.ResourceNotFoundException;
import com.data4n6.api.repository.T200ModelosRepository;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class T200ModelosService implements BaseService<T200ModelosResponse, T200ModelosRequest> {

    private final T200ModelosRepository repository;

    public T200ModelosService(T200ModelosRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<T200ModelosResponse> findAll() {
        return repository.findAllWithT200Marcas()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public T200ModelosResponse findById(UUID id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado: " + id));
    }

    @Override
    public T200ModelosResponse create(T200ModelosRequest request) {
        T200Modelos t200Modelo = new T200Modelos();
        t200Modelo.setId(UUID.randomUUID());
        t200Modelo.setT200Marcas(request.marcaId());   // ← request.marcaId() devuelve T200Marcas
        t200Modelo.setNombre(request.nombre());
        t200Modelo.setDescripcion(request.descripcion());
        return toResponse(repository.save(t200Modelo));
    }

    @Override
    public T200ModelosResponse update(UUID id, T200ModelosRequest request) {
        T200Modelos t200Modelo = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado: " + id));
        t200Modelo.setT200Marcas(request.marcaId());
        t200Modelo.setNombre(request.nombre());
        t200Modelo.setDescripcion(request.descripcion());
        return toResponse(repository.save(t200Modelo));
    }

    @Override
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Modelo no encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private T200ModelosResponse toResponse(T200Modelos modelo) {
        return new T200ModelosResponse(
                modelo.getId(),
                modelo.getT200Marcas().getId(),
                modelo.getT200Marcas().getNombre(),
                modelo.getNombre(),
                modelo.getDescripcion()
        );
    }
}
```

### T100MaterialesService.java

```java
package com.data4n6.api.service;

import com.data4n6.api.dto.T100MaterialesRequest;
import com.data4n6.api.dto.T100MaterialesResponse;
import com.data4n6.api.entity.T100Materiales;
import com.data4n6.api.entity.T200Marcas;
import com.data4n6.api.entity.T200Materiales;
import com.data4n6.api.exception.ResourceNotFoundException;
import com.data4n6.api.repository.T100MaterialesRepository;
import com.data4n6.api.repository.T200MarcasRepository;
import com.data4n6.api.repository.T200MaterialesRepository;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class T100MaterialesService implements BaseService<T100MaterialesResponse, T100MaterialesRequest> {

    private final T100MaterialesRepository t100MaterialesRepository;
    private final T200MaterialesRepository t200MaterialesRepository;
    private final T200MarcasRepository t200MarcasRepository;

    public T100MaterialesService(
            T100MaterialesRepository t100MaterialesRepository,
            T200MaterialesRepository t200MaterialesRepository,
            T200MarcasRepository t200MarcasRepository) {
        this.t100MaterialesRepository = t100MaterialesRepository;
        this.t200MaterialesRepository = t200MaterialesRepository;
        this.t200MarcasRepository = t200MarcasRepository;
    }

    @Override
    public List<T100MaterialesResponse> findAll() {
        return t100MaterialesRepository.findAllWithTodasRelaciones()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public T100MaterialesResponse findById(UUID id) {
        return t100MaterialesRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
    }

    @Override
    public T100MaterialesResponse create(T100MaterialesRequest request) {
        T200Materiales t200Material = t200MaterialesRepository.findById(request.t200MaterialesId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de material", request.t200MaterialesId()));
        T200Marcas t200Marca = t200MarcasRepository.findById(request.t200MarcasId())
                .orElseThrow(() -> new ResourceNotFoundException("Marca", request.t200MarcasId()));
        T100Materiales t100Material = new T100Materiales();
        t100Material.setId(UUID.randomUUID());
        t100Material.setT200Materiales(t200Material);
        t100Material.setT200Marcas(t200Marca);
        t100Material.setModelo(request.modelo());
        return toResponse(t100MaterialesRepository.save(t100Material));
    }

    @Override
    public T100MaterialesResponse update(UUID id, T100MaterialesRequest request) {
        T100Materiales t100Material = t100MaterialesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
        T200Materiales t200Material = t200MaterialesRepository.findById(request.t200MaterialesId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de material", request.t200MaterialesId()));
        T200Marcas t200Marca = t200MarcasRepository.findById(request.t200MarcasId())
                .orElseThrow(() -> new ResourceNotFoundException("Marca", request.t200MarcasId()));
        t100Material.setT200Materiales(t200Material);
        t100Material.setT200Marcas(t200Marca);
        t100Material.setModelo(request.modelo());
        return toResponse(t100MaterialesRepository.save(t100Material));
    }

    @Override
    public void delete(UUID id) {
        if (!t100MaterialesRepository.existsById(id)) {
            throw new ResourceNotFoundException("Material", id);
        }
        t100MaterialesRepository.deleteById(id);
    }

    private T100MaterialesResponse toResponse(T100Materiales material) {
        return new T100MaterialesResponse(
                material.getId(),
                material.getT200Materiales().getId(),
                material.getT200Materiales().getNombre(),
                material.getT200Marcas().getId(),
                material.getT200Marcas().getNombre(),
                material.getModelo()
        );
    }
}
```

> Los servicios simples (T200MaterialesService, T200EstadosService, T200EntradasAlmacenService, T200DocsService, T100AlmacenesService, T100UnidadesService, T100AgentesService) siguen el mismo patrón: `findAll()` → stream → toResponse, `findById()` → orElseThrow, `create()` → new Entity + set + save, `update()` → findById + set + save, `delete()` → existsById + deleteById.

---

## Controladores

> Todos siguen el mismo patrón. El que usa `HttpStatus.CREATED` en POST es lo correcto para creación.

```java
// Patrón general (todos los controladores son iguales salvo el path y los tipos)
@RestController
@RequestMapping("/api/inventario/t200_marcas")
public class T200MarcasController {
    @GetMapping          → ResponseEntity.ok(service.findAll())
    @GetMapping("/{id}") → ResponseEntity.ok(service.findById(id))
    @PostMapping         → ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))
    @PutMapping("/{id}") → ResponseEntity.ok(service.update(id, request))
    @DeleteMapping("/{id}") → service.delete(id); return ResponseEntity.noContent().build()
}
```

| Controlador | Path base |
|---|---|
| AuthController | `/api/auth` |
| T200MarcasController | `/api/inventario/t200_marcas` |
| T200ModelosController | `/api/inventario/t200_modelos` |
| T200MaterialesController | `/api/inventario/t200_materiales` |
| T200EstadosController | `/api/inventario/t200_estados` |
| T200EntradasAlmacenController | `/api/inventario/t200_entradas_almacen` |
| T200DocsController | `/api/inventario/t200_docs` |
| T100MaterialesController | `/api/inventario/t100_materiales` |
| T100AlmacenesController | `/api/inventario/t100_almacenes` |
| T100UnidadesController | `/api/datgen/t100_unidades` |
| T100AgentesController | `/api/personal/t100_agentes` |

### AuthController.java

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        String token = jwtService.generarToken(authentication.getName());
        return new LoginResponse(token);
    }
}
```

---

## DTOs (Records)

```java
// Auth
record LoginRequest(String username, String password) {}
record LoginResponse(String token) {}

// T200Marcas
record T200MarcasRequest(String nombre, String descripcion) {}
record T200MarcasResponse(UUID id, String nombre, String descripcion) {}

// T200Modelos
record T200ModelosRequest(UUID marcaId, String marcaNombre, String nombre, String descripcion) {}
record T200ModelosResponse(UUID id, UUID marcaId, String marcaNombre, String nombre, String descripcion) {}

// T200Materiales
record T200MaterialesRequest(String codRef, String nombre, String descripcion) {}
record T200MaterialesResponse(UUID id, String codRef, String nombre, String descripcion) {}

// T200Estados
record T200EstadosRequest(String codRef, String nombre, String descripcion) {}
record T200EstadosResponse(UUID id, String codRef, String nombre, String descripcion) {}

// T200EntradasAlmacen
record T200EntradasAlmacenRequest(String codRef, String nombre, String descripcion) {}
record T200EntradasAlmacenResponse(UUID id, String codRef, String nombre, String descripcion) {}

// T200Docs
record T200DocsRequest(String nombre, String descripcion) {}
record T200DocsResponse(UUID id, String nombre, String descripcion) {}

// T100Materiales
record T100MaterialesRequest(UUID t200MaterialesId, String t200MatereialesNombre, UUID t200MarcasId, String t200MarcasNombre, String modelo) {}
record T100MaterialesResponse(UUID id, UUID t200MaterialesId, String t200MaterialesNombre, UUID t200MarcasId, String t200MarcasNombre, String modelo) {}

// T100Almacenes
record T100AlmacenesRequest(String nombre, String descripcion, boolean esRecepcion) {}
record T100AlmacenesResponse(UUID id, String nombre, String descripcion, boolean esRecepcion) {}

// T100Unidades
record T100UnidadesRequest(String nombre, String descripcion) {}
record T100UnidadesResponse(UUID id, String nombre, String descripcion) {}

// T100Agentes
record T100AgentesRequest(UUID t100UnidadesId, String nombre, String indicativo) {}
record T100AgentesResponse(UUID id, UUID t100UnidadesId, String t100UnidadesNombre, String nombre, String indicativo) {}
```

---

## 4. Angular

### package.json (dependencias clave)

```json
{
  "dependencies": {
    "@angular/animations": "^21.2.13",
    "@angular/common": "^21.2.0",
    "@angular/compiler": "^21.2.0",
    "@angular/core": "^21.2.0",
    "@angular/forms": "^21.2.0",
    "@angular/platform-browser": "^21.2.0",
    "@angular/router": "^21.2.0",
    "@primeuix/themes": "^2.0.3",
    "primeicons": "^7.0.0",
    "primeng": "^21.1.7",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  },
  "devDependencies": {
    "@angular/build": "^21.2.11",
    "@angular/cli": "^21.2.11",
    "@angular/compiler-cli": "^21.2.0",
    "typescript": "~5.9.2"
  }
}
```

> **Importante:** `@primeuix/themes` (no `@primeng/themes` que está deprecated).  
> **Importante:** `@angular/animations` debe estar instalado o PrimeNG falla con error `firstCreatePass`.

### src/styles.css

```css
@import 'primeicons/primeicons.css';
```

### app.config.ts

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient } from '@angular/common/http';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
    provideHttpClient()
  ]
};
```

### app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/Login/login.component';
import { T200MarcasComponent } from './pages/T200Marcas/t200-marcas.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'marcas', component: T200MarcasComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
```

### app.ts

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('app');
}
```

### app.html

```html
<router-outlet />
```

---

### ApiService (`core/services/api.service.ts`)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly baseUrl = 'http://localhost:8080/api';
  private readonly http = inject(HttpClient);

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headers);
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`, { headers: this.headers() });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body, { headers: this.headers() });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${path}`, body, { headers: this.headers() });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`, { headers: this.headers() });
  }
}
```

---

### Modelos TypeScript

```typescript
// models/auth.model.ts
export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; }

// models/t200-marcas.model.ts
export interface T200Marca { id: string; nombre: string; descripcion: string; }
export interface T200MarcaRequest { nombre: string; descripcion: string; }
```

---

### Login (`pages/Login/login.component.ts`)

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LoginRequest, LoginResponse } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  form: LoginRequest = { username: '', password: '' };
  error = signal('');

  login() {
    this.api.post<LoginResponse>('auth/login', this.form).subscribe({
      next: res => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/marcas']);
      },
      error: () => this.error.set('Usuario o contraseña incorrectos')
    });
  }
}
```

```html
<!-- login.component.html -->
<div>
  <h2>DATA4N6</h2>
  <input id="username" [(ngModel)]="form.username" placeholder="Usuario" />
  <input id="password" type="password" [(ngModel)]="form.password" placeholder="Contraseña" />
  @if (error()) {
    <small>{{ error() }}</small>
  }
  <button (click)="login()">Entrar</button>
</div>
```

---

### T200Marcas (`pages/T200Marcas/t200-marcas.component.ts`)

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { T200Marca, T200MarcaRequest } from '../../models/t200-marcas.model';

@Component({
    selector: 'app-t200-marcas',
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ToastModule],
    providers: [MessageService],
    templateUrl: './t200-marcas.component.html'
})
export class T200MarcasComponent implements OnInit {

    private readonly api = inject(ApiService);
    private readonly messageService = inject(MessageService);

    marcas = signal<T200Marca[]>([]);
    dialogVisible = signal(false);
    editando = signal<T200Marca | null>(null);
    form: T200MarcaRequest = { nombre: '', descripcion: '' };

    ngOnInit() { this.cargar(); }

    cargar() {
        this.api.get<T200Marca[]>('inventario/t200_marcas').subscribe({
            next: data => this.marcas.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las marcas' })
        });
    }

    abrirCrear() {
        this.editando.set(null);
        this.form = { nombre: '', descripcion: '' };
        this.dialogVisible.set(true);
    }

    abrirEditar(marca: T200Marca) {
        this.editando.set(marca);
        this.form = { nombre: marca.nombre, descripcion: marca.descripcion };
        this.dialogVisible.set(true);
    }

    guardar() {
        const actual = this.editando();
        const op = actual
            ? this.api.put(`inventario/t200_marcas/${actual.id}`, this.form)
            : this.api.post('inventario/t200_marcas', this.form);

        op.subscribe({
            next: () => {
                this.dialogVisible.set(false);
                this.cargar();
                this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Marca guardada' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la marca' })
        });
    }

    eliminar(marca: T200Marca) {
        this.api.delete(`inventario/t200_marcas/${marca.id}`).subscribe({
            next: () => {
                this.cargar();
                this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Marca eliminada' });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la marca' })
        });
    }
}
```

```html
<!-- t200-marcas.component.html -->
<p-toast />

<div class="p-4">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Marcas</h1>
        <p-button label="Nueva marca" icon="pi pi-plus" (onClick)="abrirCrear()" />
    </div>

    <p-table [value]="marcas()" [tableStyle]="{ 'min-width': '50rem' }" stripedRows>
        <ng-template #header>
            <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template #body let-marca>
            <tr>
                <td>{{ marca.nombre }}</td>
                <td>{{ marca.descripcion }}</td>
                <td>
                    <p-button icon="pi pi-pencil" [text]="true" (onClick)="abrirEditar(marca)" />
                    <p-button icon="pi pi-trash" [text]="true" severity="danger" (onClick)="eliminar(marca)" />
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>

<p-dialog [header]="editando() ? 'Editar marca' : 'Nueva marca'"
    [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
    [modal]="true" [style]="{ width: '400px' }">

    <div class="flex flex-col gap-4 mt-2">
        <div class="flex flex-col gap-1">
            <label for="nombre">Nombre</label>
            <input pInputText id="nombre" [(ngModel)]="form.nombre" />
        </div>
        <div class="flex flex-col gap-1">
            <label for="descripcion">Descripción</label>
            <input pInputText id="descripcion" [(ngModel)]="form.descripcion" />
        </div>
    </div>

    <ng-template #footer>
        <p-button label="Cancelar" [text]="true" (onClick)="dialogVisible.set(false)" />
        <p-button label="Guardar" (onClick)="guardar()" />
    </ng-template>
</p-dialog>
```

---

## Convenciones Angular importantes

- **No poner `standalone: true`** en `@Component` — es el default en Angular v20+, ponerlo genera error `firstCreatePass`.
- **Signals para estado local:** `signal()`, `computed()`. No usar `mutate`, usar `update()` o `set()`.
- **p-dialog y signals:** NO usar `[(visible)]="miSignal"`. Usar:
  ```html
  [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
  ```
- **`inject()`** en vez de constructor injection para servicios.
- **Control flow nativo:** `@if`, `@for`, `@switch` en vez de `*ngIf`, `*ngFor`.

---

## 5. Estado actual

### Funcionando

- [x] API Spring Boot arranca en puerto 8080
- [x] JWT login con usuario `admin` / `admin`
- [x] CRUD completo de T200Marcas (GET, POST, PUT, DELETE)
- [x] DELETE con validación FK: si hay modelos asociados → 409 Conflict
- [x] Angular en puerto 4200, tema PrimeNG Aura
- [x] Login → guarda token en localStorage → navega a /marcas
- [x] Tabla de marcas con PrimeNG: listar, crear, editar, eliminar

### Pendiente

- [ ] Mostrar mensaje de error específico del backend en el toast de Angular (actualmente siempre muestra mensaje genérico)
- [ ] Barra de navegación en Angular
- [ ] Páginas Angular para el resto de entidades (T200Modelos, T100Materiales, T100Almacenes, etc.)
- [ ] Guard de ruta Angular (redirigir a login si no hay token)
- [ ] Conectar `UserDetailsServiceImpl` a tabla real de usuarios en BD (actualmente hardcodeado `admin/admin`)
- [ ] Paginación en listados

### Errores conocidos y sus soluciones

| Error | Causa | Solución |
|---|---|---|
| `firstCreatePass` en consola Angular | Falta `@angular/animations` | `npm install @angular/animations` |
| 403 en DELETE | `setAllowCredentials(true)` en CORS | Eliminar esa línea de SecurityConfig |
| FK constraint al eliminar marca | No validaba modelos asociados | `existsByT200Marcas_Id()` + ConflictException |
| Puerto 8080 ocupado al arrancar | Proceso anterior sin cerrar | `lsof -i :8080` → `kill <PID>` |
| Cache Angular rota | `.angular/cache` corrupto | `rm -rf .angular && ng serve` |
