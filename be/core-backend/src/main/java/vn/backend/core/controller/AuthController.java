package vn.backend.core.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.data.request.ChangePasswordRequest;
import vn.backend.core.data.request.SignInRequest;
import vn.backend.core.data.request.SignUpRequest;
import vn.backend.core.data.response.SignInResponse;
import vn.backend.core.exception.AppException;
import vn.backend.core.service.AuthService;
import vn.backend.core.service.UserService;
import vn.backend.core.util.Mapper;
import vn.backend.core.util.SecurityUtil;
import vn.backend.entity.data.mysql.User;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/auth/authenticate")
    public ResponseEntity<ApiResponse<SignInResponse>> signIn(@RequestBody @Valid SignInRequest request,
                                                              HttpServletResponse response) {
        var result = authService.signIn(request, response);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/auth/signup")
    public ResponseEntity<Void> signUp(@RequestBody @Valid SignUpRequest request, HttpServletResponse response) {
        authService.signUp(request, response);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/auth/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody ChangePasswordRequest request) {

        String email = SecurityUtil.getCurrentLogin().orElseThrow(
                () -> new AppException(ErrorCode.UNAUTHORIZED)
        );

        authService.changePassword(email, request.getOldPassword(), request.getNewPassword());

        return ApiResponse.okEntity("Password updated successfully");
    }
}

