# Payment Integration Documentation

This document describes the payment methods available in the application and how to use them.

## Payment Methods

The application supports the following payment methods:

1. **CASH** - Cash on delivery
2. **vietQR** - QR code payment via VietQR API
3. **VNPay** - Credit card payment via PayPal REST API v2

## VietQR Payment Integration

### Configuration

Add the following environment variables:

```
VIETQR_API_URL=https://api.vietqr.io
VIETQR_CLIENT_ID=your-vietqr-client-id
VIETQR_API_KEY=your-vietqr-api-key
```

### Endpoints

#### 1. Create Payment (Initiate QR Payment)

**POST** `/vietqr/create-payment`

Request body:
```json
{
  "orderId": 123,
  "returnUrl": "https://your-domain.com/payment-success"
}
```

Response:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "qrCode": "00020101021238...",
    "qrDataURL": "data:image/png;base64,...",
    "transactionId": "VIETQR-ABC12345",
    "amount": 100.50,
    "description": "Payment for order ORD-12345678"
  }
}
```

#### 2. Payment Callback (Host-to-Host)

**POST** `/vietqr/callback`

Request body:
```json
{
  "transactionId": "VIETQR-ABC12345",
  "externalReference": "bank-ref-123",
  "amount": 100.50,
  "currency": "VND",
  "status": "success",
  "description": "Payment completed",
  "signature": "base64-encoded-signature"
}
```

Response: `200 OK` with message string

### Signature Verification

The callback signature is verified using HMAC-SHA256:
```
data = transactionId + amount + status
signature = Base64(HMAC-SHA256(data, apiKey))
```

## VNPay (PayPal) Payment Integration

### Configuration

Add the following environment variables:

```
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

For production, use: `https://api-m.paypal.com`

### Endpoints

#### 1. Create Payment (Initiate PayPal Payment)

**POST** `/vnpay/create-payment`

Request body:
```json
{
  "orderId": 123,
  "returnUrl": "https://your-domain.com/payment-success",
  "cancelUrl": "https://your-domain.com/payment-cancel"
}
```

Response:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "orderId": "5O190127TN364715T",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T",
    "status": "PENDING"
  }
}
```

#### 2. Capture Payment

**POST** `/vnpay/capture`

Request body:
```json
{
  "orderId": "5O190127TN364715T"
}
```

Response:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "captureId": "2GG279541U471931P",
    "status": "COMPLETED",
    "amount": 100.50,
    "currency": "USD"
  }
}
```

#### 3. Refund Payment

**POST** `/vnpay/refund`

Request body:
```json
{
  "captureId": "2GG279541U471931P",
  "amount": 50.25,
  "currency": "USD",
  "note": "Partial refund for damaged item"
}
```

For full refund, omit `amount` and `currency`:
```json
{
  "captureId": "2GG279541U471931P",
  "note": "Full refund - order cancelled"
}
```

Response:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "refundId": "1JU08902781691411",
    "status": "COMPLETED",
    "amount": 50.25,
    "currency": "USD"
  }
}
```

## Payment Flow

### VietQR Flow

1. Client calls `/vietqr/create-payment` with order ID
2. Server generates QR code and creates Payment record with status PENDING
3. Client displays QR code to user
4. User scans and pays via their banking app
5. VietQR sends callback to `/vietqr/callback`
6. Server verifies signature, updates Payment status to COMPLETED
7. Server updates Order status to PROCESSING

### VNPay (PayPal) Flow

1. Client calls `/vnpay/create-payment` with order ID
2. Server creates PayPal order and creates Payment record with status PENDING
3. Server returns approval URL
4. Client redirects user to PayPal approval URL
5. User approves payment on PayPal
6. Client calls `/vnpay/capture` to complete payment
7. Server captures payment, updates Payment status to COMPLETED
8. Server updates Order status to PROCESSING

## Payment Status Transitions

- **PENDING** → **COMPLETED**: Payment successful
- **PENDING** → **FAILED**: Payment failed
- **COMPLETED** → **REFUNDED**: Payment refunded

## Database Schema

The `Payment` entity includes:

- `id`: Primary key
- `orderId`: Reference to Order
- `transactionId`: Gateway transaction ID (QR code ID, PayPal order ID)
- `externalReference`: Secondary reference (bank ref, PayPal capture ID)
- `gatewayResponse`: Full JSON response from gateway
- `amount`: Payment amount
- `currency`: Currency code (VND, USD)
- `paymentMethod`: CASH, vietQR, or VNPay
- `paymentStatus`: PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED
- `paidAt`: Timestamp of successful payment
- `metadata`: Additional info as JSON

## Testing

### Unit Tests

Run the unit tests:
```bash
mvn test -Dtest=VietQRSignatureTest
mvn test -Dtest=PayPalAuthTest
```

### Manual Testing

1. **VietQR**: Use VietQR sandbox environment with test credentials
2. **PayPal**: Use PayPal sandbox with test accounts from developer.paypal.com

## Security Considerations

1. **Signature Verification**: Always verify VietQR callback signatures
2. **Amount Validation**: Always validate payment amount matches order total
3. **Idempotency**: Callbacks may be delivered multiple times - handle idempotently
4. **HTTPS**: Always use HTTPS for callback URLs in production
5. **Credentials**: Store API keys securely in environment variables

## Migration from Stripe

1. All Stripe references have been removed
2. Default payment method changed from STRIPE to CASH
3. Update existing orders/payments to use new payment methods
4. Update frontend to use new API endpoints

## References

- VietQR API Documentation: https://api.vietqr.vn/en/vn/overview/description-of-vietqr-api-workflow
- PayPal REST API v2: https://developer.paypal.com/docs/api/payments/v2/
- PayPal OAuth: https://developer.paypal.com/api/rest/
