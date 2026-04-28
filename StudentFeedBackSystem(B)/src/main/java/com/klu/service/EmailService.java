package com.klu.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    // We are removing the JavaMailSender dependency to stop the authentication error

    public void sendOtpEmail(String toEmail, String otp) {
        // INSTEAD OF SENDING REAL EMAIL, WE JUST PRINT IT
        System.out.println("=================================================");
        System.out.println("MOCK EMAIL SERVICE ACTIVE");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: Your OTP Code");
        System.out.println("Body: Your OTP is: " + otp);
        System.out.println("=================================================");
    }
}