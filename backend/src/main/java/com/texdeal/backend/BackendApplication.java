package com.texdeal.backend;

import com.texdeal.backend.entity.AppUser;
import com.texdeal.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS order_dye_quantity_received (order_id BIGINT NOT NULL, entry_date DATE, quantity DOUBLE, remark VARCHAR(255))");
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS order_digital_quantity_received (order_id BIGINT NOT NULL, entry_date DATE, quantity DOUBLE, remark VARCHAR(255))");
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS order_dispatch_quantity_received (order_id BIGINT NOT NULL, entry_date DATE, quantity DOUBLE, remark VARCHAR(255))");
                System.out.println("✅ Schema validation complete.");
                
				String adminPhone = "9999999999";
				String adminEmail = "devvaghasiya8047@gmail.com";
				if (userRepository.findByPhoneNumber(adminPhone).isEmpty() && userRepository.findByEmail(adminEmail).isEmpty()) {
					AppUser admin = new AppUser();
					admin.setBusinessName("System Administrator");
					admin.setEmail(adminEmail);
					admin.setPhoneNumber(adminPhone);
					admin.setPassword(passwordEncoder.encode("Dev@8047"));
					admin.setRole("ADMIN");
					admin.setCreatedAt(LocalDateTime.now());
					userRepository.save(admin);
					System.out.println("✅ Admin User Auto-Created: " + adminPhone);
				}

				String userPhone = "8888888888";
				String userEmail = "khushivaghasiya015@gmail.com";
				if (userRepository.findByPhoneNumber(userPhone).isEmpty() && userRepository.findByEmail(userEmail).isEmpty()) {
					AppUser user = new AppUser();
					user.setBusinessName("Vatsalya Lifestyle Business");
					user.setEmail(userEmail);
					user.setName("Khushi");
					user.setPhoneNumber(userPhone);
					user.setPassword(passwordEncoder.encode("12345678"));
					user.setRole("USER");
					user.setCreatedAt(LocalDateTime.now());
					userRepository.save(user);
					System.out.println("✅ Default User Auto-Created: " + userPhone);
				}
			} catch (Exception e) {
				System.out.println("⚠️ Startup data initialization skipped: " + e.getMessage());
			}
		};
	}
}
