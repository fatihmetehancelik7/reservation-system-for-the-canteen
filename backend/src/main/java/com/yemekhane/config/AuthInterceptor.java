package com.yemekhane.config;

import com.yemekhane.entity.Role;
import com.yemekhane.entity.User;
import com.yemekhane.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || !request.getRequestURI().startsWith("/api/")) {
            return true;
        }

        if ("/api/users/login".equals(request.getRequestURI())) {
            return true;
        }

        User user = resolveUser(request);
        if (user == null) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Oturum bulunamadı veya geçersiz.");
            return false;
        }

        request.setAttribute("authenticatedUser", user);

        if (requiresAdmin(request) && user.getRol() != Role.ADMIN) {
            writeError(response, HttpServletResponse.SC_FORBIDDEN, "Bu işlem için admin yetkisi gereklidir.");
            return false;
        }

        return true;
    }

    private User resolveUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer dummy-jwt-token-")) {
            return null;
        }

        try {
            Long userId = Long.parseLong(header.substring("Bearer dummy-jwt-token-".length()));
            return userRepository.findById(userId).orElse(null);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean requiresAdmin(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.equals("/api/users") || path.equals("/api/reservations") || path.equals("/api/holidays/refunds")) {
            return true;
        }
        if (path.startsWith("/api/menus") && ("POST".equals(method) || "DELETE".equals(method))) {
            return true;
        }
        if (path.startsWith("/api/holidays") && ("POST".equals(method) || "DELETE".equals(method))) {
            return true;
        }

        return false;
    }

    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
