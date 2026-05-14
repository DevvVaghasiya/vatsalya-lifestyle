package com.texdeal.backend.controller;

import com.texdeal.backend.entity.Client;
import com.texdeal.backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @PostMapping
    public Client createClient(@RequestBody Client client) {
        return clientRepository.save(client);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            if (!clientRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            clientRepository.deleteById(id);
            return ResponseEntity.ok().body(java.util.Collections.singletonMap("message", "Client deleted successfully"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Cannot delete client because they have associated orders or inquiries."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Collections.singletonMap("error", "Failed to delete client."));
        }
    }
}
