package com.example.backend.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class JwtRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final JwtGrantedAuthoritiesConverter defaultGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // Default JWT scopes parsing
        Collection<GrantedAuthority> authorities = defaultGrantedAuthoritiesConverter.convert(jwt);
        if (authorities == null) {
            authorities = new ArrayList<>();
        } else {
            authorities = new ArrayList<>(authorities);
        }

        // Keycloak - Realm Roles mapping
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            for (String role : roles) {
                // By adding standard "ROLE_" prefix, we can use hasRole() elegantly!
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            }
        }

        // Keycloak - Groups mapping (Hierarchical Support)
        List<String> groups = jwt.getClaimAsStringList("groups");
        if (groups != null) {
            for (String group : groups) {
                String[] parts = group.split("/");
                String currentPath = "";
                for (String part : parts) {
                    if (part.isEmpty()) continue;
                    currentPath += "/" + part;
                    // Adding each level of the hierarchy as a separate group authority (no prefix)
                    authorities.add(new SimpleGrantedAuthority(currentPath));
                }
            }
        }

        return authorities;
    }
}
