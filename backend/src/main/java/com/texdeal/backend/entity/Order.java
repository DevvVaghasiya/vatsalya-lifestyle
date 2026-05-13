package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "handler"}, ignoreUnknown = true)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    private String styleNo;
    private String fabricName;
    private String fabricStyle;
    private String width;
    private String gsm;
    private String countConst;
    private String design;
    private String quality;

    // Fabric Booking Section
    private String weaver;
    private String bookingReferenceNo;
    private String bookingFabricName;
    private String bookingQuantity;
    private String challan;
    private String price;
    private String bookingCountConst;
    private String bookingWidth;
    private String finishGsm;
    private String bookingComposition;
    private String completionDate;

    private String fabricJobWorkMill;
    private String dyeMillName;
    private String dyeJobCharge;
    private String dyeFinishQuantity;
    private String dyeWidth;
    private String dyeColorDesign;
    private String dyeShortage;
    private String dyeDeliveryDate;
    private String digitalMillName;
    private String digitalJobCharge;
    private String digitalFinishQuantity;
    private String digitalWidth;
    private String digitalDesign;
    private String digitalShortage;
    private String digitalDeliveryDate;

    private String dispatchInvoiceNumber;
    private String dispatchMeter;
    private String dispatchDesignColour;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_dye_quantity_received", joinColumns = @JoinColumn(name = "order_id"))
    private List<QuantityReceivedEntry> dyeQuantityReceivedEntries = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_digital_quantity_received", joinColumns = @JoinColumn(name = "order_id"))
    private List<QuantityReceivedEntry> digitalQuantityReceivedEntries = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_dispatch_quantity_received", joinColumns = @JoinColumn(name = "order_id"))
    private List<QuantityReceivedEntry> dispatchQuantityReceivedEntries = new ArrayList<>();

    private Double quantity; // In Meters
    
    private Double rate; // Custom rate for this deal
    
    private Double totalAmount;
    private Double extraExpense;
    private Double discount;
    private Double grandTotal;

    private Double advancePaid;
    private LocalDate dueDate;
    private String paymentMethod;
    private Integer creditDays;

    private String transportName;
    private String lrNumber;
    private String vehicleNumber;
    private LocalDate dispatchDate;

    private LocalDate deliveryDate;

    @Column(length = 500)
    private String notes;

    private String priority; // LOW, NORMAL, URGENT, VIP

    @Convert(converter = OrderStatusConverter.class)
    @Column(name = "order_status", length = 20)
    private OrderStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    public enum OrderStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        CANCELED,
        CANCELLED
    }
}
