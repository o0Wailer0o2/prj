package vn.backend.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jooq.JooqAutoConfiguration;

@SpringBootApplication(exclude = {JooqAutoConfiguration.class})
public class BaseBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BaseBackendApplication.class, args);
    }

}
