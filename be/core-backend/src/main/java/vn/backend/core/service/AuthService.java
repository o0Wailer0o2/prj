package vn.backend.core.service;

import com.nimbusds.jwt.SignedJWT;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.data.request.LogoutRequest;
import vn.backend.core.data.request.SignInRequest;
import vn.backend.core.data.request.SignUpRequest;
import vn.backend.core.data.response.RefreshTokenResponse;
import vn.backend.core.data.response.SignInResponse;
import vn.backend.core.exception.AppException;
import vn.backend.entity.data.mysql.User;

import java.text.ParseException;
import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
@Service
@Slf4j(topic = "AUTHENTICATION-SERVICE")
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    @Value("${DOMAIN:localhost}")
    private String domain;

    private final JwtService jwtService;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final RedisService redisService;
    private final UserService userService;

    @Value("${jwt.secret-key-refresh-token}")
    private String secretKeyRefreshToken;

    @Value("${jwt.expiration-refresh-token}")
    private int expirationRefreshToken;


    public SignInResponse signIn(SignInRequest request, HttpServletResponse response) {
        try {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userService.getUserByEmail(authentication.getName());

            final String accessToken = jwtService.generateAccessToken(user);
            final String refreshToken = jwtService.generateRefreshToken(user);

            Cookie cookie = createRefreshTokenCookie(refreshToken);
            response.addCookie(cookie);

            return SignInResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .build();
        } catch (Exception e) {
            log.error("Authentication failed: ", e);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public void signUp(SignUpRequest request, HttpServletResponse response) {
        try {
            // 1. Check if user already exists
            if (userService.getUserByEmail(request.getEmail()) != null) {
                throw new AppException(ErrorCode.DUPLICATED_USER);
            }

            // 2. Create new user
            User newUser = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFullname())
                    .build();

            userService.insertUser(newUser);

        } catch (Exception e) {
            log.error("Signup failed: ", e);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userService.getUserByEmail(email);

        if (user == null) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_AUTHENTICATION_INFO);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userService.updateUser(user);
    }

    private Cookie createRefreshTokenCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setDomain(domain);
        cookie.setPath("/");
        cookie.setMaxAge(expirationRefreshToken);
        return cookie;
    }

    public RefreshTokenResponse refreshToken(String refreshToken) {
        if (StringUtils.isBlank(refreshToken)) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        String username = jwtService.extractUsername(refreshToken);
        User user = userService.getUserByEmail(username);

        try {
            boolean isValidToken = jwtService.verificationToken(refreshToken, secretKeyRefreshToken);
            if (!isValidToken) {
                throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
            }
            String accessToken = jwtService.generateAccessToken(user);
            log.info("refresh token success");
            return RefreshTokenResponse.builder()
                    .accessToken(accessToken)
                    .userId(user.getId())
                    .build();
        } catch (Exception e) {
            log.error("Error while refresh token");
            throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
        }
    }

    public void logout(LogoutRequest request, HttpServletResponse response) {
        long accessTokenExp = jwtService.extractTokenExpired(request.getAccessToken());
        if(accessTokenExp > 0) {
            try {
                String jwtId = SignedJWT.parse(request.getAccessToken()).getJWTClaimsSet().getJWTID();
                redisService.save(jwtId, request.getAccessToken(), accessTokenExp, TimeUnit.MILLISECONDS);
                deleteRefreshTokenCookie(response);
            } catch (ParseException e) {
                throw new AppException(ErrorCode.SIGN_OUT_FAILED);
            }
        }
    }

    private void deleteRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
