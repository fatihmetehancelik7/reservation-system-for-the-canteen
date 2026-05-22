package com.yemekhane.entity;

public enum PaymentStatus {
    PENDING_PAYMENT,
    PAID,
    FAILED,
    CANCELLED,
    REFUND_PENDING,
    REFUNDED,

    /**
     * @deprecated Use PAID.
     */
    @Deprecated
    ODENDI,

    /**
     * @deprecated Use PENDING_PAYMENT.
     */
    @Deprecated
    BEKLIYOR
}
