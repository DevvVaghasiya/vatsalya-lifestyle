package com.texdeal.backend.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class OrderStatusConverter implements AttributeConverter<Order.OrderStatus, String> {

    @Override
    public String convertToDatabaseColumn(Order.OrderStatus status) {
        return status == null ? null : status.name();
    }

    @Override
    public Order.OrderStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        String normalized = dbData.trim().replaceAll("\\s+", "_").toUpperCase();

        try {
            return Order.OrderStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            switch (normalized) {
                case "CANCELED":
                case "CANCELLED":
                    return Order.OrderStatus.CANCELLED;
                case "PROCESSING":
                    return Order.OrderStatus.PROCESSING;
                case "PENDING":
                    return Order.OrderStatus.PENDING;
                case "COMPLETED":
                    return Order.OrderStatus.COMPLETED;
                default:
                    return null;
            }
        }
    }
}
