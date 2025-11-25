package fpt.aptech.springbootapp.configs;

import org.springframework.context.annotation.*;
import org.springframework.web.client.RestTemplate;

@Configuration
public class FaceRecognitionConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
