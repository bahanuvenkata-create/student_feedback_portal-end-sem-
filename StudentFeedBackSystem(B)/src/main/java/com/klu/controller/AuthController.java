package com.klu.controller;

import com.klu.entity.Student;
import com.klu.repo.StudentRepository;
import com.klu.service.EmailService;
import com.klu.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") 
public class AuthController {

    @Autowired private StudentRepository studentRepo;
    @Autowired private EmailService emailService;
    @Autowired private OtpService otpService;
    @Autowired private BCryptPasswordEncoder passwordEncoder; // Injected BCrypt

    @GetMapping("/captcha")
    public ResponseEntity<Map<String, String>> getCaptcha() {
        Random rnd = new Random();
        String captchaText = String.format("%04d", rnd.nextInt(10000));
        Map<String, String> response = new HashMap<>();
        response.put("captcha", captchaText);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginStudent(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String inputCaptcha = body.get("inputCaptcha");
        String sessionCaptcha = body.get("sessionCaptcha");

        // Check if captcha is null before comparing
        if (inputCaptcha == null || sessionCaptcha == null) {
            return ResponseEntity.badRequest().body("Captcha is missing from request");
        }

        if (!inputCaptcha.equalsIgnoreCase(sessionCaptcha)) {
            return ResponseEntity.badRequest().body("Invalid Captcha");
        }
        
        // ... rest of your code

        Student student = studentRepo.findByUsername(username).orElse(null);
        // Use BCrypt matches() instead of .equals()
        if (student != null && passwordEncoder.matches(password, student.getPassword())) {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", student.getId());
            userData.put("username", student.getUsername());
            userData.put("email", student.getEmail());
            userData.put("branch", student.getBranch());
            userData.put("role", "STUDENT");
            return ResponseEntity.ok(userData);
        }
        return ResponseEntity.badRequest().body("Invalid Credentials");
    }
    @PostMapping("/admin-login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String inputCaptcha = body.get("inputCaptcha");
        String sessionCaptcha = body.get("sessionCaptcha");

        // Still checking Captcha
        if (!inputCaptcha.equalsIgnoreCase(sessionCaptcha)) {
            return ResponseEntity.badRequest().body("Invalid Captcha");
        }
        
        // Direct Login Check (No OTP)
        if ("pavansaiyadlapall@gmail.com".equals(email) && "xyz123".equals(password)) {
            // Create User Data immediately
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("email", email);
            adminData.put("username", "Admin");
            adminData.put("role", "ADMIN");
            return ResponseEntity.ok(adminData);
        }
        return ResponseEntity.badRequest().body("Invalid Admin Credentials");
    }
 // Inside AuthController.java - Update the verify-otp method

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String inputOtp = body.get("otp");
        System.out.println("=== VERIFY OTP DEBUG ===");
        System.out.println("Email: " + email);
        System.out.println("Input OTP: " + inputOtp);
        System.out.println("Stored OTP in Map: " + otpService.generateOtp(email));
        System.out.println("========================");

        if (otpService.validateOtp(email, inputOtp)) {
            otpService.clearOtp(email);
            
            // Return user data for the frontend to recognize success
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("email", email);
            adminData.put("role", "ADMIN");
            adminData.put("valid", true); // Explicitly set valid
            return ResponseEntity.ok(adminData);
        }
        return ResponseEntity.badRequest().body("Invalid OTP. Please check your console/box.");
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        System.out.println("=== FORGOT PASSWORD DEBUG ===");
        System.out.println("Attempting to find email: " + email);
        System.out.println("==============================");

        // 1. Check if user exists in Database
        Student student = studentRepo.findByEmail(email).orElse(null);
        
        if (student == null) {
            System.out.println("RESULT: Email NOT FOUND in Database");
            return ResponseEntity.badRequest().body("Email not found. Please enter your registered email.");
        }
        
        // 2. Generate OTP
        String otp = otpService.generateOtp(email);
        System.out.println("OTP Generated for " + email + " is: " + otp);

        // 3. Try to Send Email
        try {
            emailService.sendOtpEmail(email, otp);
            System.out.println("RESULT: Email sent successfully via Mock Service");
            return ResponseEntity.ok("OTP sent to email");
        } catch (Exception e) {
            // If email sending fails, we still proceed (Mock Service)
            System.out.println("Email sending failed, but proceeding with OTP logic. Error: " + e.getMessage());
            return ResponseEntity.ok("OTP generated successfully. (Check console for OTP)");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (!otpService.validateOtp(email, otp)) return ResponseEntity.badRequest().body("Invalid OTP");
        
        Student student = studentRepo.findByEmail(email).orElse(null);
        if (student != null) {
            // ENCRYPT PASSWORD BEFORE SAVING
            student.setPassword(passwordEncoder.encode(newPassword)); 
            studentRepo.save(student);
            otpService.clearOtp(email);
            return ResponseEntity.ok("Password reset successfully");
        }
        return ResponseEntity.badRequest().body("Error resetting password");
    }
}