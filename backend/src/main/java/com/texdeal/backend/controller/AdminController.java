package com.texdeal.backend.controller;

import com.texdeal.backend.entity.AppUser;
import com.texdeal.backend.entity.Order;
import com.texdeal.backend.repository.OrderRepository;
import com.texdeal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
