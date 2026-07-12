package com.transitops.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI transitOpsOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("TransitOps Fleet Management API")
                        .version("1.0")
                        .description("REST API for managing vehicles, drivers, trips, maintenance, fuel logs, expenses and dashboard analytics."));
    }
}