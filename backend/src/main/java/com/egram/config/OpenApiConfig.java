package com.egram.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI egramOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Egram API")
                        .description("Egram – Professional Learning Platform REST API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Egram Team")
                                .email("support@egram.com"))
                        .license(new License()
                                .name("MIT License")));
    }
}
