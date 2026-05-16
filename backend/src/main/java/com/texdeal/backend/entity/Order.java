package com.texdeal.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_client_id", columnList = "client_id"),
    @Index(name = "idx_orders_user_id", columnList = "user_id"),
    @Index(name = "idx_orders_status", columnList = "order_status"),
    @Index(name = "idx_orders_created_at", columnList = "createdAt"),
    @Index(name = "idx_orders_style_no", columnList = "styleNo"),
    @Index(name = "idx_orders_reference_no", columnList = "referenceNo")
})
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "handler"}, ignoreUnknown = true)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    private String styleNo;
    private String fabricName;
    private String referenceNo;
    private Double orderQuantity;
    private Double orderPrice;
    private String width;
    private String gsm;
    private String countConst;
    private String design;
    private String quality;
    private Integer orderDays;

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

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "order_dye_quantity_received", joinColumns = @JoinColumn(name = "order_id"))
    private List<QuantityReceivedEntry> dyeQuantityReceivedEntries = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "order_digital_quantity_received", joinColumns = @JoinColumn(name = "order_id"))
    private List<QuantityReceivedEntry> digitalQuantityReceivedEntries = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_edited_by_id")
    private AppUser lastEditedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    public enum OrderStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        CANCELED,
        CANCELLED,
        DELAYED
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public Inventory getInventory() { return inventory; }
    public void setInventory(Inventory inventory) { this.inventory = inventory; }

    public String getStyleNo() { return styleNo; }
    public void setStyleNo(String styleNo) { this.styleNo = styleNo; }

    public String getFabricName() { return fabricName; }
    public void setFabricName(String fabricName) { this.fabricName = fabricName; }

    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }

    public Double getOrderQuantity() { return orderQuantity; }
    public void setOrderQuantity(Double orderQuantity) { this.orderQuantity = orderQuantity; }

    public Double getOrderPrice() { return orderPrice; }
    public void setOrderPrice(Double orderPrice) { this.orderPrice = orderPrice; }

    public String getWidth() { return width; }
    public void setWidth(String width) { this.width = width; }

    public String getGsm() { return gsm; }
    public void setGsm(String gsm) { this.gsm = gsm; }

    public String getCountConst() { return countConst; }
    public void setCountConst(String countConst) { this.countConst = countConst; }

    public String getDesign() { return design; }
    public void setDesign(String design) { this.design = design; }

    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }

    public Integer getOrderDays() { return orderDays; }
    public void setOrderDays(Integer orderDays) { this.orderDays = orderDays; }

    public String getWeaver() { return weaver; }
    public void setWeaver(String weaver) { this.weaver = weaver; }

    public String getBookingReferenceNo() { return bookingReferenceNo; }
    public void setBookingReferenceNo(String bookingReferenceNo) { this.bookingReferenceNo = bookingReferenceNo; }

    public String getBookingFabricName() { return bookingFabricName; }
    public void setBookingFabricName(String bookingFabricName) { this.bookingFabricName = bookingFabricName; }

    public String getBookingQuantity() { return bookingQuantity; }
    public void setBookingQuantity(String bookingQuantity) { this.bookingQuantity = bookingQuantity; }

    public String getChallan() { return challan; }
    public void setChallan(String challan) { this.challan = challan; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getBookingCountConst() { return bookingCountConst; }
    public void setBookingCountConst(String bookingCountConst) { this.bookingCountConst = bookingCountConst; }

    public String getBookingWidth() { return bookingWidth; }
    public void setBookingWidth(String bookingWidth) { this.bookingWidth = bookingWidth; }

    public String getFinishGsm() { return finishGsm; }
    public void setFinishGsm(String finishGsm) { this.finishGsm = finishGsm; }

    public String getBookingComposition() { return bookingComposition; }
    public void setBookingComposition(String bookingComposition) { this.bookingComposition = bookingComposition; }

    public String getCompletionDate() { return completionDate; }
    public void setCompletionDate(String completionDate) { this.completionDate = completionDate; }

    public String getFabricJobWorkMill() { return fabricJobWorkMill; }
    public void setFabricJobWorkMill(String fabricJobWorkMill) { this.fabricJobWorkMill = fabricJobWorkMill; }

    public String getDyeMillName() { return dyeMillName; }
    public void setDyeMillName(String dyeMillName) { this.dyeMillName = dyeMillName; }

    public String getDyeJobCharge() { return dyeJobCharge; }
    public void setDyeJobCharge(String dyeJobCharge) { this.dyeJobCharge = dyeJobCharge; }

    public String getDyeFinishQuantity() { return dyeFinishQuantity; }
    public void setDyeFinishQuantity(String dyeFinishQuantity) { this.dyeFinishQuantity = dyeFinishQuantity; }

    public String getDyeWidth() { return dyeWidth; }
    public void setDyeWidth(String dyeWidth) { this.dyeWidth = dyeWidth; }

    public String getDyeColorDesign() { return dyeColorDesign; }
    public void setDyeColorDesign(String dyeColorDesign) { this.dyeColorDesign = dyeColorDesign; }

    public String getDyeShortage() { return dyeShortage; }
    public void setDyeShortage(String dyeShortage) { this.dyeShortage = dyeShortage; }

    public String getDyeDeliveryDate() { return dyeDeliveryDate; }
    public void setDyeDeliveryDate(String dyeDeliveryDate) { this.dyeDeliveryDate = dyeDeliveryDate; }

    public String getDigitalMillName() { return digitalMillName; }
    public void setDigitalMillName(String digitalMillName) { this.digitalMillName = digitalMillName; }

    public String getDigitalJobCharge() { return digitalJobCharge; }
    public void setDigitalJobCharge(String digitalJobCharge) { this.digitalJobCharge = digitalJobCharge; }

    public String getDigitalFinishQuantity() { return digitalFinishQuantity; }
    public void setDigitalFinishQuantity(String digitalFinishQuantity) { this.digitalFinishQuantity = digitalFinishQuantity; }

    public String getDigitalWidth() { return digitalWidth; }
    public void setDigitalWidth(String digitalWidth) { this.digitalWidth = digitalWidth; }

    public String getDigitalDesign() { return digitalDesign; }
    public void setDigitalDesign(String digitalDesign) { this.digitalDesign = digitalDesign; }

    public String getDigitalShortage() { return digitalShortage; }
    public void setDigitalShortage(String digitalShortage) { this.digitalShortage = digitalShortage; }

    public String getDigitalDeliveryDate() { return digitalDeliveryDate; }
    public void setDigitalDeliveryDate(String digitalDeliveryDate) { this.digitalDeliveryDate = digitalDeliveryDate; }

    public String getDispatchInvoiceNumber() { return dispatchInvoiceNumber; }
    public void setDispatchInvoiceNumber(String dispatchInvoiceNumber) { this.dispatchInvoiceNumber = dispatchInvoiceNumber; }

    public String getDispatchMeter() { return dispatchMeter; }
    public void setDispatchMeter(String dispatchMeter) { this.dispatchMeter = dispatchMeter; }

    public String getDispatchDesignColour() { return dispatchDesignColour; }
    public void setDispatchDesignColour(String dispatchDesignColour) { this.dispatchDesignColour = dispatchDesignColour; }

    public List<QuantityReceivedEntry> getDyeQuantityReceivedEntries() { return dyeQuantityReceivedEntries; }
    public void setDyeQuantityReceivedEntries(List<QuantityReceivedEntry> dyeQuantityReceivedEntries) { this.dyeQuantityReceivedEntries = dyeQuantityReceivedEntries; }

    public List<QuantityReceivedEntry> getDigitalQuantityReceivedEntries() { return digitalQuantityReceivedEntries; }
    public void setDigitalQuantityReceivedEntries(List<QuantityReceivedEntry> digitalQuantityReceivedEntries) { this.digitalQuantityReceivedEntries = digitalQuantityReceivedEntries; }

    public List<QuantityReceivedEntry> getDispatchQuantityReceivedEntries() { return dispatchQuantityReceivedEntries; }
    public void setDispatchQuantityReceivedEntries(List<QuantityReceivedEntry> dispatchQuantityReceivedEntries) { this.dispatchQuantityReceivedEntries = dispatchQuantityReceivedEntries; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getExtraExpense() { return extraExpense; }
    public void setExtraExpense(Double extraExpense) { this.extraExpense = extraExpense; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(Double grandTotal) { this.grandTotal = grandTotal; }

    public Double getAdvancePaid() { return advancePaid; }
    public void setAdvancePaid(Double advancePaid) { this.advancePaid = advancePaid; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Integer getCreditDays() { return creditDays; }
    public void setCreditDays(Integer creditDays) { this.creditDays = creditDays; }

    public String getTransportName() { return transportName; }
    public void setTransportName(String transportName) { this.transportName = transportName; }

    public String getLrNumber() { return lrNumber; }
    public void setLrNumber(String lrNumber) { this.lrNumber = lrNumber; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public LocalDate getDispatchDate() { return dispatchDate; }
    public void setDispatchDate(LocalDate dispatchDate) { this.dispatchDate = dispatchDate; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public AppUser getLastEditedBy() { return lastEditedBy; }
    public void setLastEditedBy(AppUser lastEditedBy) { this.lastEditedBy = lastEditedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
