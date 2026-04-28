package com.klu.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {
    private Map<String, String> otpStore = new HashMap<>();

    public String generateOtp(String email) {
        Random random = new Random();
        String otp = String.format("%04d", random.nextInt(10000));
        otpStore.put(email, otp);
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        return otp.equals(otpStore.get(email));
    }
    
    public void clearOtp(String email) {
        otpStore.remove(email);
    }
}