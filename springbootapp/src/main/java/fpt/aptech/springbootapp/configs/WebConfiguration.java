package fpt.aptech.springbootapp.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebConfiguration implements WebMvcConfigurer{

    @Value("${python.face-service.url:http://localhost:5000}")
    private String pythonServiceUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public WebClient webClient(){
        return WebClient.builder()
                .baseUrl(pythonServiceUrl)
                .build();

    }
}
