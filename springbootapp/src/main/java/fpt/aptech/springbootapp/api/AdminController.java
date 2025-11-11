package fpt.aptech.springbootapp.api;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/test")
    public String testAdmin() {
        return "Hi Admin";
    }
}

