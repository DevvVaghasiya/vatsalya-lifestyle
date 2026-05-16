package com.texdeal.backend.controller;

import com.texdeal.backend.entity.Order;
import com.texdeal.backend.repository.ClientRepository;
import com.texdeal.backend.repository.InventoryRepository;
import com.texdeal.backend.repository.OrderRepository;
import com.texdeal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public Order createOrder(@RequestBody Order order) {
        System.out.println("--- NEW ORDER CREATION ---");
        if (order.getClient() != null && order.getClient().getId() != null) {
            order.setClient(clientRepository.getReferenceById(order.getClient().getId()));
        }
        if (order.getUser() != null && order.getUser().getId() != null) {
            order.setUser(userRepository.getReferenceById(order.getUser().getId()));
            order.setLastEditedBy(order.getUser());
        }
        if (order.getInventory() != null && order.getInventory().getId() != null) {
            order.setInventory(inventoryRepository.getReferenceById(order.getInventory().getId()));
        }
        if (order.getDyeQuantityReceivedEntries() == null) {
            order.setDyeQuantityReceivedEntries(new java.util.ArrayList<>());
        }
        if (order.getDigitalQuantityReceivedEntries() == null) {
            order.setDigitalQuantityReceivedEntries(new java.util.ArrayList<>());
        }
        if (order.getDispatchQuantityReceivedEntries() == null) {
            order.setDispatchQuantityReceivedEntries(new java.util.ArrayList<>());
        }
        System.out.println("Dye entries: " + order.getDyeQuantityReceivedEntries().size() + ", Digital entries: " + order.getDigitalQuantityReceivedEntries().size() + ", Dispatch entries: " + order.getDispatchQuantityReceivedEntries().size());
        return orderRepository.save(order);
    }

    @PutMapping("/{id}")
    @Transactional
    public Order updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
        System.out.println("--- ORDER UPDATE --- ID: " + id);
        return orderRepository.findById(id).map(order -> {
            order.setStyleNo(orderDetails.getStyleNo());
            order.setFabricName(orderDetails.getFabricName());
            order.setReferenceNo(orderDetails.getReferenceNo());
            order.setOrderQuantity(orderDetails.getOrderQuantity());
            order.setOrderPrice(orderDetails.getOrderPrice());
            order.setWidth(orderDetails.getWidth());
            order.setGsm(orderDetails.getGsm());
            order.setCountConst(orderDetails.getCountConst());
            order.setDesign(orderDetails.getDesign());
            order.setQuality(orderDetails.getQuality());
            order.setOrderDays(orderDetails.getOrderDays());
            
            // Update Fabric Booking Section
            order.setWeaver(orderDetails.getWeaver());
            order.setBookingReferenceNo(orderDetails.getBookingReferenceNo());
            order.setBookingFabricName(orderDetails.getBookingFabricName());
            order.setBookingQuantity(orderDetails.getBookingQuantity());
            order.setChallan(orderDetails.getChallan());
            order.setPrice(orderDetails.getPrice());
            order.setBookingCountConst(orderDetails.getBookingCountConst());
            order.setBookingWidth(orderDetails.getBookingWidth());
            order.setFinishGsm(orderDetails.getFinishGsm());
            order.setBookingComposition(orderDetails.getBookingComposition());
            order.setCompletionDate(orderDetails.getCompletionDate());
            order.setFabricJobWorkMill(orderDetails.getFabricJobWorkMill());
            order.setDyeMillName(orderDetails.getDyeMillName());
            order.setDyeJobCharge(orderDetails.getDyeJobCharge());
            order.setDyeFinishQuantity(orderDetails.getDyeFinishQuantity());
            order.setDyeWidth(orderDetails.getDyeWidth());
            order.setDyeColorDesign(orderDetails.getDyeColorDesign());
            order.setDyeShortage(orderDetails.getDyeShortage());
            order.setDyeDeliveryDate(orderDetails.getDyeDeliveryDate());
            order.setDigitalMillName(orderDetails.getDigitalMillName());
            order.setDigitalJobCharge(orderDetails.getDigitalJobCharge());
            order.setDigitalFinishQuantity(orderDetails.getDigitalFinishQuantity());
            order.setDigitalWidth(orderDetails.getDigitalWidth());
            order.setDigitalDesign(orderDetails.getDigitalDesign());
            order.setDigitalShortage(orderDetails.getDigitalShortage());
            order.setDigitalDeliveryDate(orderDetails.getDigitalDeliveryDate());
            order.setDispatchDate(orderDetails.getDispatchDate());
            order.setDispatchInvoiceNumber(orderDetails.getDispatchInvoiceNumber());
            order.setDispatchMeter(orderDetails.getDispatchMeter());
            order.setDispatchDesignColour(orderDetails.getDispatchDesignColour());
            order.setDyeQuantityReceivedEntries(orderDetails.getDyeQuantityReceivedEntries());
            order.setDigitalQuantityReceivedEntries(orderDetails.getDigitalQuantityReceivedEntries());
            order.setDispatchQuantityReceivedEntries(orderDetails.getDispatchQuantityReceivedEntries());
            
            order.setQuantity(orderDetails.getQuantity());
            order.setRate(orderDetails.getRate());
            order.setExtraExpense(orderDetails.getExtraExpense());
            order.setTotalAmount(orderDetails.getTotalAmount());
            order.setGrandTotal(orderDetails.getGrandTotal());
            order.setAdvancePaid(orderDetails.getAdvancePaid());
            order.setStatus(orderDetails.getStatus());
            order.setNotes(orderDetails.getNotes());
            order.setTransportName(orderDetails.getTransportName());
            order.setLrNumber(orderDetails.getLrNumber());
            order.setVehicleNumber(orderDetails.getVehicleNumber());
            order.setCreditDays(orderDetails.getCreditDays());
            order.setDispatchDate(orderDetails.getDispatchDate());
            order.setDeliveryDate(orderDetails.getDeliveryDate());

            if (orderDetails.getLastEditedBy() != null && orderDetails.getLastEditedBy().getId() != null) {
                order.setLastEditedBy(userRepository.getReferenceById(orderDetails.getLastEditedBy().getId()));
            }

            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found with id " + id));
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        System.out.println("--- ORDER STATUS UPDATE --- ID: " + id + " STATUS: " + status);
        return orderRepository.findById(id).map(order -> {
            order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
            return orderRepository.save(order);
        }).orElseThrow(() -> new RuntimeException("Order not found with id " + id));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        System.out.println("--- ORDER DELETION --- ID: " + id);
        return orderRepository.findById(id).map(order -> {
            orderRepository.delete(order);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
