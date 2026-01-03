package vn.backend.core.constant;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    BAD_REQUEST(400, "Yêu cầu không hợp lệ"),
    UNAUTHORIZED(401, "Token không hợp lệ hoặc sai chữ ký"),
    TOKEN_EXPIRED(401, "Token đã hết hạn"),
    FORBIDDEN(403, "Không có quyền truy cập"),
    LOCK_ACCOUNT(403, "Tài khoản bị khóa"),
    NOT_FOUND(404, "Không tìm thấy tài nguyên"),
    INTERNAL_ERROR(500, "Lỗi hệ thống"),

    DUPLICATED_USER(400, "Số điện thoại tạo tài khoản đã tồn tại trong hệ thống"),
    INVALID_AUTHENTICATION_INFO(400, "Tài khoản hoặc mật khẩu không đúng."),
    DUPLICATED_EMAIL(400, "Email tạo tài khoản đã tồn tại"),
    UPLOAD_FILE_FAILED(400, "Upload file thất bại"),

    WRONG_LOGIN_INFO(400, "Sai thông tin đăng nhập. Kiểm tra lại tài khoản hoặc mật khẩu!"),
    MISSING_PASSWORD(400, "Chưa nhập mật khẩu!"),
    MISSING_EMAIL_OR_PHONE(400, "Chưa nhập email hoặc số điện thoại!"),
    REGISTRATION_DISABLED(403, "Hệ thống không mở đăng ký"),
    TOKEN_INVALID(400, "Token invalid"),
    TOKEN_BLACK_LIST(400, "Token black list"),
    SIGN_OUT_FAILED(400, "Sign out failed"),
    JWT_EXPIRED(401, "JWT token has expired"),
    JWT_MALFORMED(400, "JWT token is malformed"),
    JWT_SIGNATURE_INVALID(401, "JWT signature is invalid"),
    JWT_UNSUPPORTED(400, "JWT token is unsupported"),
    JWT_CLAIMS_EMPTY(400, "JWT claims string is empty"),
    ACCESS_DINED(403, "Access denied"),
    REFRESH_TOKEN_INVALID(401, "Refresh token invalid"),

    ;

    public final int code;
    public final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
