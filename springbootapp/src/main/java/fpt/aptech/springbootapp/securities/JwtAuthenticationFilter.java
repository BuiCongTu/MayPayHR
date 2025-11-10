package fpt.aptech.springbootapp.securities;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (request.getServletPath().contains("/api/auth/login") ||
                request.getServletPath().contains("/api/auth/register") ||
                request.getServletPath().contains("/api/auth/forgot-password") ||
                request.getServletPath().contains("/api/auth/reset-password") ||
                request.getServletPath().contains("/api/payroll/")  ||
                request.getServletPath().contains("/api/overtime-request/") ||
                request.getServletPath().contains("/api/overtime-ticket/") ||
                request.getServletPath().contains("/api/overtime/") ||
                request.getServletPath().contains("/api/proposal/")) {
            filterChain.doFilter(request, response);
            return;
        }


        // Lấy token từ header Authorization
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        // kiem tra token coi có hợp lệ không
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cắt "Bearer "
            try {
                email = jwtUtils.getEmailFromJwt(token); // lấy email từ token
            } catch (Exception e) {
                System.out.println("Not valid: " + e.getMessage());
            }
        }

        // nếu lấy được email và chưa có Authentication trong context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // kiểm tra tính hợp lệ của token
            if (jwtUtils.validateToken(token, email)) {

                // lấy role từ claim trong token (mặc định: USER)
                String role = (String) jwtUtils.extractAllClaims(token).get("role");
                if (role == null)
                    role = "USER";

                // tạo danh sách quyền hạn
                List<SimpleGrantedAuthority> authorities = List
                        .of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                // tạo Authentication token cho Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, null,
                        authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // gắn xác thực vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println(" Authenticated: " + email + " | Role: " + role);
            }
        }

        // tiếp tục filter chain
        filterChain.doFilter(request, response);
    }
}

